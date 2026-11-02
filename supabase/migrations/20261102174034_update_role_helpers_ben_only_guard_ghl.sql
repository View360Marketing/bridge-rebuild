-- Update is_admin to include both admin and super_admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('super_admin','admin'))
$$;

-- is_manager includes super_admin, admin, manager
CREATE OR REPLACE FUNCTION public.is_manager(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('super_admin','admin','manager'))
$$;

-- Resolve Ben's immutable auth user id by email
CREATE OR REPLACE FUNCTION public.ben_user_id()
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT id FROM auth.users WHERE lower(email) = 'ben@view360.marketing' LIMIT 1
$$;

-- DB-level guard: only Ben may hold super_admin; Ben's super_admin row is immutable
CREATE OR REPLACE FUNCTION public.guard_super_admin()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE ben_id uuid;
BEGIN
  ben_id := public.ben_user_id();
  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') AND NEW.role = 'super_admin'
     AND NEW.user_id IS DISTINCT FROM ben_id THEN
    RAISE EXCEPTION 'Only ben@view360.marketing may hold the super_admin role.';
  END IF;
  IF (TG_OP = 'DELETE' OR TG_OP = 'UPDATE')
     AND OLD.role = 'super_admin' AND OLD.user_id = ben_id THEN
    RAISE EXCEPTION 'Cannot remove or change Ben''s super_admin role.';
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS user_roles_guard_super_admin ON public.user_roles;
CREATE TRIGGER user_roles_guard_super_admin
BEFORE INSERT OR UPDATE OR DELETE ON public.user_roles
FOR EACH ROW EXECUTE FUNCTION public.guard_super_admin();

-- Migrate any non-Ben super_admin to admin (audited)
INSERT INTO public.audit_events (actor_id, action, entity_type, entity_id, metadata)
SELECT 'system', 'role.migrate_super_admin_to_admin', 'user_roles',
       ur.user_id::text,
       jsonb_build_object('from','super_admin','to','admin','reason','Ben-only super_admin policy')
FROM public.user_roles ur
WHERE ur.role = 'super_admin' AND ur.user_id IS DISTINCT FROM public.ben_user_id();

UPDATE public.user_roles
SET role = 'admin'
WHERE role = 'super_admin' AND user_id IS DISTINCT FROM public.ben_user_id();

-- Add source tracking to guests
ALTER TABLE public.guests
  ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'website',
  ADD COLUMN IF NOT EXISTS ghl_contact_id text;
CREATE INDEX IF NOT EXISTS guests_ghl_contact_id_idx ON public.guests (ghl_contact_id);

-- GoHighLevel contact mapping table
CREATE TABLE IF NOT EXISTS public.ghl_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ghl_contact_id text NOT NULL,
  ghl_location_id text NOT NULL,
  guest_id uuid REFERENCES public.guests(id) ON DELETE SET NULL,
  first_name text,
  last_name text,
  email text,
  phone text,
  source text,
  tags text[] DEFAULT '{}',
  dnd boolean DEFAULT false,
  custom_fields jsonb DEFAULT '{}'::jsonb,
  last_synced_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (ghl_location_id, ghl_contact_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ghl_contacts TO authenticated;
GRANT ALL ON public.ghl_contacts TO service_role;
ALTER TABLE public.ghl_contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff read ghl contacts" ON public.ghl_contacts
  FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "managers write ghl contacts" ON public.ghl_contacts
  FOR ALL TO authenticated USING (public.is_manager(auth.uid())) WITH CHECK (public.is_manager(auth.uid()));

-- GHL sync log
CREATE TABLE IF NOT EXISTS public.ghl_sync_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sync_type text NOT NULL,
  status text NOT NULL,
  imported_count int DEFAULT 0,
  updated_count int DEFAULT 0,
  failed_count int DEFAULT 0,
  error text,
  started_at timestamptz DEFAULT now(),
  finished_at timestamptz
);
GRANT SELECT ON public.ghl_sync_log TO authenticated;
GRANT ALL ON public.ghl_sync_log TO service_role;
ALTER TABLE public.ghl_sync_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff read ghl sync log" ON public.ghl_sync_log
  FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));

-- Social posts local tracking (mirrors GHL Social Planner)
CREATE TABLE IF NOT EXISTS public.social_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ghl_post_id text,
  status text NOT NULL DEFAULT 'draft',
  body text,
  media_urls text[] DEFAULT '{}',
  account_ids text[] DEFAULT '{}',
  scheduled_at timestamptz,
  published_at timestamptz,
  error text,
  created_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.social_posts TO authenticated;
GRANT ALL ON public.social_posts TO service_role;
ALTER TABLE public.social_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff read social posts" ON public.social_posts
  FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "managers write social posts" ON public.social_posts
  FOR ALL TO authenticated USING (public.is_manager(auth.uid())) WITH CHECK (public.is_manager(auth.uid()));

-- Preview sessions for "View as" (server-validated, read-only)
CREATE TABLE IF NOT EXISTS public.preview_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid NOT NULL,
  target_role text,
  target_user_id uuid,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.preview_sessions TO authenticated;
GRANT ALL ON public.preview_sessions TO service_role;
ALTER TABLE public.preview_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner read preview sessions" ON public.preview_sessions
  FOR SELECT TO authenticated USING (actor_id = auth.uid());
CREATE POLICY "owner manage preview sessions" ON public.preview_sessions
  FOR ALL TO authenticated USING (actor_id = auth.uid()) WITH CHECK (actor_id = auth.uid());