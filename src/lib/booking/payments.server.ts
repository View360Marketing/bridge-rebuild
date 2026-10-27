import type { SupabaseClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { runIdempotent } from "./idempotency";
import { createCheckoutSession, retrieveCheckoutSession, retrievePaymentIntent, getStripeConfig } from "./stripe.server";
import { confirmReservationPayment } from "./payments-confirm.server";

/**
 * Checkout provisioning & status — server-only.
 *
 * Durable state sequence:
 *   inventory held → checkout provisioning → checkout attached →
 *   pending payment → confirmed (or exception).
 *
 * The Stripe API call happens OUTSIDE the DB transaction. A timeout does NOT
 * mean the session wasn't created — we reconcile using the same idempotency key.
 */

export type CreateCheckoutInput = {
  reservation_id: string;
  guest_email?: string | undefined;
  /** Trusted origin for return URLs — never a client-supplied arbitrary URL. */
  origin: string;
};

export type CheckoutResult = {
  reservation_id: string;
  booking_reference: string;
  checkout_url: string | null;
  status: string;
  amount_due_cents: number;
  currency: string;
  stripe_configured: boolean;
};

/** Trusted application origin whitelist for return URLs. */
const ALLOWED_ORIGINS = [
  "https://preview-1790196628861484830.vibepreview.app",
  "https://bridge-rebuild.vibepreview.app",
  "http://localhost:8080",
  "http://localhost:3000",
];

function sanitizeOrigin(origin: string): string {
  return ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]!;
}

/** Create a Stripe Checkout Session for a reservation's outstanding balance. Idempotent. */
export async function createCheckout(
  supabase: SupabaseClient,
  input: CreateCheckoutInput,
): Promise<CheckoutResult> {
  const { data: reservation, error } = await supabase
    .from("reservations")
    .select("id, booking_reference, status, total_cents, paid_cents, currency, guest_id")
    .eq("id", input.reservation_id)
    .single();
  if (error || !reservation) throw new Error("Reservation not found.");

  const bookingReference = reservation.booking_reference as string;
  const amountDue = Math.max(0, (reservation.total_cents as number) - (reservation.paid_cents as number));
  if (amountDue <= 0) {
    return {
      reservation_id: reservation.id,
      booking_reference: bookingReference,
      checkout_url: null,
      status: reservation.status as string,
      amount_due_cents: 0,
      currency: reservation.currency as string,
      stripe_configured: getStripeConfig().configured,
    };
  }

  const stripeStatus = getStripeConfig();
  if (!stripeStatus.configured) {
    return {
      reservation_id: reservation.id,
      booking_reference: bookingReference,
      checkout_url: null,
      status: reservation.status as string,
      amount_due_cents: amountDue,
      currency: reservation.currency as string,
      stripe_configured: false,
    };
  }

  const origin = sanitizeOrigin(input.origin);
  const idempotencyKey = `checkout-${reservation.id}-${amountDue}`;
  const successUrl = `${origin}/booking/status?reservation=${reservation.id}&session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${origin}/booking/status?reservation=${reservation.id}&canceled=1`;

  const attempt = await runIdempotent(
    supabaseAdmin,
    { key: idempotencyKey, scope: "checkout", operation: "create_checkout" },
    { reservation_id: reservation.id, amount_due: amountDue },
    async () => {
      await supabaseAdmin
        .from("reservations")
        .update({ status: "pending_payment", updated_at: new Date().toISOString() })
        .eq("id", reservation.id);

      const sessionParams: Parameters<typeof createCheckoutSession>[0] = {
        amount_cents: amountDue,
        currency: reservation.currency as string,
        reservationId: reservation.id,
        bookingReference,
        successUrl,
        cancelUrl,
        idempotencyKey,
        metadata: { reservation_id: reservation.id, booking_reference: bookingReference },
      };
      if (input.guest_email) sessionParams.customerEmail = input.guest_email;
      const session = await createCheckoutSession(sessionParams);

      const { data: attemptRow } = await supabaseAdmin
        .from("payment_attempts")
        .insert({
          reservation_id: reservation.id,
          idempotency_key: idempotencyKey,
          scope: "guest",
          provider: "stripe",
          provider_account_id: stripeStatus.config.accountId ?? null,
          provider_session_id: session.id,
          provider_payment_intent_id: session.payment_intent,
          provider_checkout_url: session.url,
          expected_amount_cents: amountDue,
          currency: reservation.currency as string,
          environment: stripeStatus.config.environment,
          status: "pending_payment",
          expires_at: session.expires_at
            ? new Date(session.expires_at * 1000).toISOString()
            : new Date(Date.now() + 30 * 60_000).toISOString(),
        })
        .select("id")
        .single();

      return {
        attempt_id: (attemptRow as { id: string } | null)?.id ?? null,
        session_id: session.id,
        checkout_url: session.url,
        payment_intent: session.payment_intent,
        expires_at: session.expires_at,
      };
    },
  );

  return {
    reservation_id: reservation.id,
    booking_reference: bookingReference,
    checkout_url: attempt.checkout_url,
    status: "pending_payment",
    amount_due_cents: amountDue,
    currency: reservation.currency as string,
    stripe_configured: true,
  };
}

export type ReservationStatusView = {
  reservation_id: string;
  booking_reference: string;
  status: string;
  total_cents: number;
  paid_cents: number;
  amount_due_cents: number;
  currency: string;
  checkin_date: string;
  checkout_date: string;
  adults: number;
  children: number;
  units: { unit_code: string; public_name: string | null }[];
  payment_processing: boolean;
  stripe_configured: boolean;
};

/** Authoritative reservation + payment status. The return page calls this. */
export async function getReservationStatus(
  supabase: SupabaseClient,
  reservationId: string,
): Promise<ReservationStatusView> {
  const { data: r, error } = await supabase
    .from("reservations")
    .select(
      "id, booking_reference, status, total_cents, paid_cents, currency, checkin_date, checkout_date, adults, children, reservation_units(units(unit_code, public_name))",
    )
    .eq("id", reservationId)
    .single();
  if (error || !r) throw new Error("Reservation not found.");

  const reservation = r as unknown as {
    id: string;
    booking_reference: string;
    status: string;
    total_cents: number;
    paid_cents: number;
    currency: string;
    checkin_date: string;
    checkout_date: string;
    adults: number;
    children: number;
    reservation_units: { units: { unit_code: string; public_name: string | null } | null }[];
  };

  const { data: attempts } = await supabaseAdmin
    .from("payment_attempts")
    .select("id, provider_session_id, provider_payment_intent_id, status, expected_amount_cents")
    .eq("reservation_id", reservationId)
    .order("created_at", { ascending: false })
    .limit(1);
  const attempt = (attempts ?? [])[0] as
    | {
        id: string;
        provider_session_id: string | null;
        provider_payment_intent_id: string | null;
        status: string;
        expected_amount_cents: number;
      }
    | undefined;

  let paymentProcessing = false;
  if (attempt && attempt.status === "pending_payment" && attempt.provider_session_id) {
    const stripeStatus = getStripeConfig();
    if (stripeStatus.configured) {
      paymentProcessing = true;
      try {
        await reconcileAttempt(attempt.id, attempt.provider_session_id, attempt.provider_payment_intent_id);
      } catch {
        // Reconciliation failure leaves the attempt pending — webhook will finalize.
      }
    }
  }

  const units = reservation.reservation_units
    .map((ru) => ru.units)
    .filter((u): u is { unit_code: string; public_name: string | null } => u != null);

  return {
    reservation_id: reservation.id,
    booking_reference: reservation.booking_reference,
    status: reservation.status,
    total_cents: reservation.total_cents,
    paid_cents: reservation.paid_cents,
    amount_due_cents: Math.max(0, reservation.total_cents - reservation.paid_cents),
    currency: reservation.currency,
    checkin_date: reservation.checkin_date,
    checkout_date: reservation.checkout_date,
    adults: reservation.adults,
    children: reservation.children,
    units,
    payment_processing: paymentProcessing,
    stripe_configured: getStripeConfig().configured,
  };
}

/** Reconcile a payment attempt against authoritative Stripe state. Idempotent. */
export async function reconcileAttempt(
  attemptId: string,
  sessionId: string | null,
  paymentIntentId: string | null,
): Promise<{ confirmed: boolean }> {
  const stripeStatus = getStripeConfig();
  if (!stripeStatus.configured) return { confirmed: false };

  let paymentStatus = "";
  let amount = 0;
  let currency = "";
  let intentId = paymentIntentId;

  if (sessionId) {
    const session = await retrieveCheckoutSession(sessionId);
    paymentStatus = session.payment_status;
    amount = session.amount_total ?? 0;
    currency = session.currency ?? "usd";
    intentId = session.payment_intent ?? intentId;
  } else if (intentId) {
    const intent = await retrievePaymentIntent(intentId);
    paymentStatus = intent.status === "succeeded" ? "paid" : intent.status;
    amount = intent.amount;
    currency = intent.currency;
  } else {
    return { confirmed: false };
  }

  const { data: attempt } = await supabaseAdmin
    .from("payment_attempts")
    .select("id, reservation_id, expected_amount_cents, currency, environment")
    .eq("id", attemptId)
    .single();
  const a = attempt as
    | {
        id: string;
        reservation_id: string;
        expected_amount_cents: number;
        currency: string;
        environment: string;
      }
    | null;
  if (!a) return { confirmed: false };

  if (
    paymentStatus === "paid" &&
    amount === a.expected_amount_cents &&
    currency.toLowerCase() === a.currency.toLowerCase()
  ) {
    await confirmReservationPayment(a.reservation_id, intentId, amount, currency, a.environment, attemptId);
    return { confirmed: true };
  }

  if (paymentStatus === "unpaid" || paymentStatus === "no_payment_required") {
    return { confirmed: false };
  }

  await supabaseAdmin
    .from("payment_attempts")
    .update({ status: paymentStatus === "paid" ? "succeeded" : "failed", updated_at: new Date().toISOString() })
    .eq("id", attemptId);

  return { confirmed: false };
}
