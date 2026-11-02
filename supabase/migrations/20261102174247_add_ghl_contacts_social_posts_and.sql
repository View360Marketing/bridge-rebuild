-- Add GHL contact linkage to guests
ALTER TABLE public.guests ADD COLUMN IF NOT EXISTS ghl_contact_id text;
CREATE INDEX IF NOT EXISTS guests_ghl_contact_id_idx ON public.guests (ghl_contact_id);

-- GoHighLevel contact mapping table
CREATE TABLE IF NOT EXISTS public.ghl_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ghl_contact_id text NOT NULL,
  ghl_location_id text NOT NULL,
  first_name text,
  last_name text,
  email text,
  phone text,
  address text,
  contact_source text,
  tags text[] DEFAULT '{}',
  dnd_opted_out boolean DEFAULT false,
  last_synced_at timestamptz,
  linked_guest_id uuid REFERENCES public.guests(id) ON DELETE SET NULL,
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