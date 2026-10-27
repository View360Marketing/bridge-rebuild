-- Stage 3: Guest booking, Stripe test-mode payments, secure reservation access.
-- All money is integer cents. All provider IDs are stored as unique where required.
-- RLS + GRANTs on every new public table. No auth/storage/realtime schema changes.

-- payment_attempts ----------------------------------------------------------
-- One durable record per attempt to collect a payment for a reservation.
-- Idempotent by (idempotency_key, scope); stable provider session/PaymentIntent IDs.
CREATE TABLE IF NOT EXISTS public.payment_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id uuid NOT NULL REFERENCES public.reservations(id) ON DELETE CASCADE,
  idempotency_key text NOT NULL,
  scope text NOT NULL DEFAULT 'guest',
  provider text NOT NULL DEFAULT 'stripe',
  provider_account_id text,
  provider_session_id text,
  provider_payment_intent_id text,
  provider_checkout_url text,
  expected_amount_cents int NOT NULL CHECK (expected_amount_cents >= 0),
  currency text NOT NULL DEFAULT 'USD',
  environment text NOT NULL DEFAULT 'test',
  status text NOT NULL DEFAULT 'provisioning'
    CHECK (status IN ('provisioning','pending_payment','succeeded','failed','cancelled','expired','exception')),
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (idempotency_key, scope)
);
CREATE UNIQUE INDEX IF NOT EXISTS payment_attempts_session_unique
  ON public.payment_attempts (provider, provider_session_id)
  WHERE provider_session_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS payment_attempts_intent_unique
  ON public.payment_attempts (provider, provider_payment_intent_id)
  WHERE provider_payment_intent_id IS NOT NULL;
GRANT SELECT, INSERT, UPDATE ON public.payment_attempts TO authenticated;
GRANT ALL ON public.payment_attempts TO service_role;
ALTER TABLE public.payment_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff manage payment attempts" ON public.payment_attempts
  FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- payment_transactions ------------------------------------------------------
-- Authoritative provider payment records (one per provider charge/payment).
CREATE TABLE IF NOT EXISTS public.payment_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id uuid NOT NULL REFERENCES public.reservations(id) ON DELETE CASCADE,
  payment_attempt_id uuid REFERENCES public.payment_attempts(id) ON DELETE SET NULL,
  provider text NOT NULL DEFAULT 'stripe',
  provider_account_id text,
  provider_transaction_id text NOT NULL,
  amount_cents int NOT NULL CHECK (amount_cents >= 0),
  currency text NOT NULL DEFAULT 'USD',
  environment text NOT NULL DEFAULT 'test',
  status text NOT NULL DEFAULT 'processing'
    CHECK (status IN ('processing','succeeded','failed','cancelled')),
  captured_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (provider, provider_transaction_id)
);
GRANT SELECT ON public.payment_transactions TO authenticated;
GRANT ALL ON public.payment_transactions TO service_role;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff manage payment transactions" ON public.payment_transactions
  FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- refunds ------------------------------------------------------------------
-- Refund operations tracked separately from cancellation. Idempotent by provider refund ID.
CREATE TABLE IF NOT EXISTS public.refunds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id uuid NOT NULL REFERENCES public.reservations(id) ON DELETE CASCADE,
  payment_transaction_id uuid NOT NULL REFERENCES public.payment_transactions(id) ON DELETE CASCADE,
  provider text NOT NULL DEFAULT 'stripe',
  provider_refund_id text,
  amount_cents int NOT NULL CHECK (amount_cents >= 0),
  currency text NOT NULL DEFAULT 'USD',
  status text NOT NULL DEFAULT 'requested'
    CHECK (status IN ('requested','pending','succeeded','failed')),
  reason text,
  idempotency_key text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (provider, provider_refund_id)
);
GRANT SELECT ON public.refunds TO authenticated;
GRANT ALL ON public.refunds TO service_role;
ALTER TABLE public.refunds ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff manage refunds" ON public.refunds
  FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- reservation_access_capabilities ------------------------------------------
-- Cryptographically random, scoped, revocable access tokens for guest reservation pages.
-- A booking reference / surname / email alone never grants access.
CREATE TABLE IF NOT EXISTS public.reservation_access_capabilities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id uuid NOT NULL REFERENCES public.reservations(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  scope text NOT NULL DEFAULT 'guest',
  label text,
  expires_at timestamptz,
  revoked_at timestamptz,
  last_used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.reservation_access_capabilities TO authenticated;
GRANT ALL ON public.reservation_access_capabilities TO service_role;
ALTER TABLE public.reservation_access_capabilities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff manage access capabilities" ON public.reservation_access_capabilities
  FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- outbox_jobs --------------------------------------------------------------
-- Durable, deduplicated notification jobs. Stage 5 connects provider delivery.
CREATE TABLE IF NOT EXISTS public.outbox_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id uuid REFERENCES public.reservations(id) ON DELETE CASCADE,
  kind text NOT NULL,
  dedup_key text,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'queued'
    CHECK (status IN ('queued','sending','sent','failed','cancelled')),
  attempts int NOT NULL DEFAULT 0,
  last_error text,
  next_attempt_at timestamptz NOT NULL DEFAULT now(),
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (kind, dedup_key)
);
GRANT SELECT, INSERT, UPDATE ON public.outbox_jobs TO authenticated;
GRANT ALL ON public.outbox_jobs TO service_role;
ALTER TABLE public.outbox_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff manage outbox" ON public.outbox_jobs
  FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- inbound_events -----------------------------------------------------------
-- Durable webhook inbox. Unique by (provider, provider_event_id). Survives retries/crashes.
CREATE TABLE IF NOT EXISTS public.inbound_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL,
  provider_event_id text NOT NULL,
  event_type text,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'received'
    CHECK (status IN ('received','processing','processed','failed')),
  processed_at timestamptz,
  error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (provider, provider_event_id)
);
GRANT SELECT, INSERT, UPDATE ON public.inbound_events TO authenticated;
GRANT ALL ON public.inbound_events TO service_role;
ALTER TABLE public.inbound_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff manage inbound events" ON public.inbound_events
  FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- Extend integration_settings for payment configuration --------------------
ALTER TABLE public.integration_settings
  ADD COLUMN IF NOT EXISTS stripe_configured boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS stripe_environment text NOT NULL DEFAULT 'test',
  ADD COLUMN IF NOT EXISTS deposit_percent int,
  ADD COLUMN IF NOT EXISTS balance_deadline_days int;

-- Helper: compute amount due now for a reservation (total - paid), floored at 0.
-- Used by the checkout provisioning flow so the server — not the client — owns totals.
CREATE OR REPLACE FUNCTION public.reservation_amount_due(p_reservation_id uuid)
RETURNS int
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT GREATEST(0, COALESCE(r.total_cents, 0) - COALESCE(r.paid_cents, 0))
  FROM public.reservations r
  WHERE r.id = p_reservation_id;
$$;
GRANT EXECUTE ON FUNCTION public.reservation_amount_due TO service_role;