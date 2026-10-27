-- Add airbnb_listing_id, airbnb_url, and ical feed settings to units
ALTER TABLE public.units
  ADD COLUMN IF NOT EXISTS airbnb_listing_id text,
  ADD COLUMN IF NOT EXISTS airbnb_url text,
  ADD COLUMN IF NOT EXISTS ical_import_url text,
  ADD COLUMN IF NOT EXISTS ical_export_token text DEFAULT gen_random_uuid()::text,
  ADD COLUMN IF NOT EXISTS ical_last_synced_at timestamptz,
  ADD COLUMN IF NOT EXISTS ical_sync_status text DEFAULT 'unverified';

CREATE INDEX IF NOT EXISTS idx_units_airbnb_listing_id ON public.units(airbnb_listing_id);

-- Outgoing webhook endpoints table
CREATE TABLE IF NOT EXISTS public.outgoing_webhook_endpoints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  url text NOT NULL,
  events text[] NOT NULL DEFAULT '{}',
  is_enabled boolean NOT NULL DEFAULT true,
  secret text NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Outgoing webhook deliveries table
CREATE TABLE IF NOT EXISTS public.outgoing_webhook_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint_id uuid REFERENCES public.outgoing_webhook_endpoints(id) ON DELETE CASCADE,
  event_name text NOT NULL,
  payload jsonb NOT NULL,
  status text NOT NULL DEFAULT 'pending', -- pending, success, failed
  status_code integer,
  error_message text,
  attempt_count integer NOT NULL DEFAULT 1,
  delivered_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.outgoing_webhook_endpoints TO authenticated;
GRANT ALL ON public.outgoing_webhook_endpoints TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.outgoing_webhook_deliveries TO authenticated;
GRANT ALL ON public.outgoing_webhook_deliveries TO service_role;

ALTER TABLE public.outgoing_webhook_endpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outgoing_webhook_deliveries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff manage webhook endpoints" ON public.outgoing_webhook_endpoints
  FOR ALL TO authenticated
  USING (public.is_staff(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Staff read webhook deliveries" ON public.outgoing_webhook_deliveries
  FOR ALL TO authenticated
  USING (public.is_staff(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));