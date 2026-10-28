-- iCal two-way sync tables and settings

-- Per-feed sync log: tracks each Airbnb feed import run
CREATE TABLE IF NOT EXISTS public.ical_sync_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id uuid NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
  feed_url text NOT NULL,
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  status text NOT NULL DEFAULT 'running',
  imported_count integer NOT NULL DEFAULT 0,
  updated_count integer NOT NULL DEFAULT 0,
  cancelled_count integer NOT NULL DEFAULT 0,
  error_message text,
  raw_event_count integer NOT NULL DEFAULT 0
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.ical_sync_log TO authenticated;
GRANT ALL ON public.ical_sync_log TO service_role;
ALTER TABLE public.ical_sync_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff manage ical sync log" ON public.ical_sync_log
  FOR ALL TO authenticated USING (public.is_staff(auth.uid()))
  WITH CHECK (public.is_staff(auth.uid()));

-- Imported event cache: dedup by feed UID, supports cancellation detection
CREATE TABLE IF NOT EXISTS public.ical_imported_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id uuid NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
  feed_uid text NOT NULL,
  ical_uid text NOT NULL,
  summary text,
  dtstart timestamptz,
  dtend timestamptz,
  status text NOT NULL DEFAULT 'confirmed',
  source text NOT NULL DEFAULT 'airbnb',
  imported_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (unit_id, feed_uid)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.ical_imported_events TO authenticated;
GRANT ALL ON public.ical_imported_events TO service_role;
ALTER TABLE public.ical_imported_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff manage ical imported events" ON public.ical_imported_events
  FOR ALL TO authenticated USING (public.is_staff(auth.uid()))
  WITH CHECK (public.is_staff(auth.uid()));

-- Sync settings
ALTER TABLE public.integration_settings
  ADD COLUMN IF NOT EXISTS ical_sync_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS ical_sync_interval_minutes integer NOT NULL DEFAULT 5,
  ADD COLUMN IF NOT EXISTS ical_export_base_url text,
  ADD COLUMN IF NOT EXISTS ical_stale_after_hours integer NOT NULL DEFAULT 24;

CREATE INDEX IF NOT EXISTS idx_ical_imported_events_unit ON public.ical_imported_events(unit_id);
CREATE INDEX IF NOT EXISTS idx_ical_sync_log_unit ON public.ical_sync_log(unit_id, started_at);