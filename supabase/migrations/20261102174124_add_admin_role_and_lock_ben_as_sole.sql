-- Add the new 'admin' staff role value to the app_role enum.
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'admin';

-- Migrate any non-Ben super_admin accounts down to 'admin' (preserve account, records, history).
-- Ben@view360.marketing is the only account permitted to hold super_admin.
UPDATE public.user_roles ur
SET role = 'admin'
WHERE ur.role = 'super_admin'
  AND ur.user_id NOT IN (
    SELECT au.id FROM auth.users au WHERE lower(au.email) = lower('ben@view360.marketing')
  );

-- Redefine the role helpers for the three-tier model:
--   super_admin (Ben) -> full access
--   admin            -> manager-plus (manage rooms/rates/promotions, refunds, manager accounts)
--   manager          -> operations (reservations, calendar, check-in/out, guest contact)
--   front_desk / housekeeping / read_only remain as limited operational roles.
CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = 'super_admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('super_admin','admin')
  );
$$;

CREATE OR REPLACE FUNCTION public.is_manager(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('super_admin','admin','manager')
  );
$$;

-- is_staff remains: any recognized staff role.
CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('super_admin','admin','manager','front_desk','housekeeping','read_only')
  );
$$;

-- Count active super_admins (non-banned) for last-admin protection.
CREATE OR REPLACE FUNCTION public.count_active_super_admins()
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT count(*)::integer
  FROM public.user_roles ur
  JOIN auth.users au ON au.id = ur.user_id
  WHERE ur.role = 'super_admin'
    AND (au.banned_until IS NULL OR au.banned_until < now())
$$;

-- Guard: prevent removing or demoting Ben's super_admin role through ordinary user_roles writes.
-- This trigger blocks DELETE/UPDATE that would leave Ben without super_admin.
CREATE OR REPLACE FUNCTION public.protect_ben_super_admin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  ben_id uuid;
BEGIN
  SELECT au.id INTO ben_id FROM auth.users au WHERE lower(au.email) = lower('ben@view360.marketing');
  IF ben_id IS NULL THEN
    RETURN NEW; -- nothing to protect until Ben exists
  END IF;

  IF (TG_OP = 'DELETE') THEN
    IF OLD.user_id = ben_id AND OLD.role = 'super_admin' THEN
      RAISE EXCEPTION 'Cannot remove super_admin from ben@view360.marketing';
    END IF;
    RETURN OLD;
  END IF;

  IF (TG_OP = 'UPDATE') THEN
    IF NEW.user_id = ben_id AND NEW.role <> 'super_admin' AND OLD.role = 'super_admin' THEN
      RAISE EXCEPTION 'Cannot demote ben@view360.marketing from super_admin';
    END IF;
    -- Ensure Ben keeps a super_admin row
    IF NEW.user_id = ben_id AND NEW.role <> 'super_admin' THEN
      -- only block if this would remove Ben's only super_admin row
      IF NOT EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = ben_id AND role = 'super_admin' AND id <> NEW.id
      ) THEN
        RAISE EXCEPTION 'Ben@view360.marketing must retain super_admin';
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_ben_super_admin ON public.user_roles;
CREATE TRIGGER trg_protect_ben_super_admin
  BEFORE DELETE OR UPDATE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_ben_super_admin();

-- Ensure Ben's super_admin role exists and is correct.
INSERT INTO public.user_roles (user_id, role)
SELECT au.id, 'super_admin'
FROM auth.users au
WHERE lower(au.email) = lower('ben@view360.marketing')
  AND NOT EXISTS (
    SELECT 1 FROM public.user_roles ur WHERE ur.user_id = au.id AND ur.role = 'super_admin'
  )
ON CONFLICT DO NOTHING;

GRANT EXECUTE ON FUNCTION public.is_super_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_manager(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_staff(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.count_active_super_admins() TO authenticated;

-- Re-grant tables (harmless re-grants to keep the authenticated role list complete).
GRANT SELECT ON public.user_roles TO authenticated;