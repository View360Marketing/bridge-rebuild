-- Stage 4: Staff dashboard & daily operations.
-- Non-destructive, incremental. Inspects existing tables before adding equivalent ones.

-- manual_payments: staff-authorized ledger for funds collected outside this website.
-- Records funds already collected (cash/check/external terminal). Never triggers a Stripe charge.
CREATE TABLE IF NOT EXISTS public.manual_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id uuid NOT NULL REFERENCES public.reservations(id) ON DELETE CASCADE,
  amount_cents int NOT NULL CHECK (amount_cents > 0),
  currency text NOT NULL DEFAULT 'USD',
  method text NOT NULL CHECK (method IN ('cash','check','external_card','other')),
  reference text,
  collected_by uuid NOT NULL REFERENCES auth.users(id),
  collected_at timestamptz NOT NULL DEFAULT now(),
  notes text,
  -- reversal linkage: a reversal entry references the original payment it reverses.
  reverses_id uuid REFERENCES public.manual_payments(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS manual_payments_reservation_idx ON public.manual_payments (reservation_id);
CREATE INDEX IF NOT EXISTS manual_payments_reverses_idx ON public.manual_payments (reverses_id);
GRANT SELECT, INSERT ON public.manual_payments TO authenticated;
GRANT ALL ON public.manual_payments TO service_role;
ALTER TABLE public.manual_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff manage manual payments" ON public.manual_payments
  FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- Extend reservations with internal staff notes + guest requests (separate from guest-visible data).
ALTER TABLE public.reservations
  ADD COLUMN IF NOT EXISTS staff_notes text,
  ADD COLUMN IF NOT EXISTS guest_requests text;

-- Extend housekeeping_tasks with inspection attribution + turnover priority + same-day flag.
ALTER TABLE public.housekeeping_tasks
  ADD COLUMN IF NOT EXISTS inspected_by uuid REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS inspected_at timestamptz,
  ADD COLUMN IF NOT EXISTS priority text NOT NULL DEFAULT 'normal'
    CHECK (priority IN ('low','normal','high','turnover')),
  ADD COLUMN IF NOT EXISTS is_turnover boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS reservation_id uuid REFERENCES public.reservations(id) ON DELETE SET NULL;

-- Extend units with an operational cleanliness state separate from overnight occupancy.
ALTER TABLE public.units
  ADD COLUMN IF NOT EXISTS cleanliness_state text NOT NULL DEFAULT 'clean'
    CHECK (cleanliness_state IN ('clean','dirty','cleaning','inspected','out_of_service'));

-- Extend integration_settings with operational defaults.
ALTER TABLE public.integration_settings
  ADD COLUMN IF NOT EXISTS default_cleanliness_on_checkout text NOT NULL DEFAULT 'dirty',
  ADD COLUMN IF NOT EXISTS same_day_turnover_enabled boolean NOT NULL DEFAULT true;