-- Per-manager module access permissions.
-- Keyed by user_id + module. Only the super_admin (Ben) may write these rows.
CREATE TABLE IF NOT EXISTS public.manager_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  module text NOT NULL,
  access text NOT NULL DEFAULT 'none' CHECK (access IN ('none','view','manage')),
  updated_by uuid,
  updated_at timestamptz DEFAULT now(),
  UNIQUE (user_id, module)
);

GRANT SELECT ON public.manager_permissions TO authenticated;
GRANT ALL ON public.manager_permissions TO service_role;
ALTER TABLE public.manager_permissions ENABLE ROW LEVEL SECURITY;

-- Staff can read their own permissions; admins (super_admin/admin) can read all.
CREATE POLICY "staff read own manager permissions"
  ON public.manager_permissions
  FOR SELECT TO authenticated
  USING (public.is_staff(auth.uid()));

CREATE POLICY "super admin manage manager permissions"
  ON public.manager_permissions
  FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid()))
  WITH CHECK (public.is_super_admin(auth.uid()));