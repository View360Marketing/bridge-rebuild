import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Json } from "@/integrations/supabase/types";
import { createRefund, getStripeConfig, type StripeWebhookEvent } from "./stripe.server";

/**
 * Payment confirmation, webhook processing, and refunds — server-only.
 * Idempotent by (provider, provider_transaction_id) for transactions and
 * (provider, provider_event_id) for inbound events.
 */

/** Confirm a reservation payment. Idempotent. Queues deduplicated outbox jobs. */
export async function confirmReservationPayment(
  reservationId: string,
  providerTransactionId: string | null,
  amountCents: number,
  currency: string,
  environment: string,
  attemptId?: string,
): Promise<void> {
  if (!providerTransactionId) return;

  const { data: tx, error: txErr } = await supabaseAdmin
    .from("payment_transactions")
    .insert({
      reservation_id: reservationId,
      payment_attempt_id: attemptId ?? null,
      provider: "stripe",
      provider_transaction_id: providerTransactionId,
      amount_cents: amountCents,
      currency: currency.toUpperCase(),
      environment,
      status: "succeeded",
      captured_at: new Date().toISOString(),
    })
    .select("id")
    .single();
  if (txErr) return; // unique violation → already recorded (duplicate-event guard)
  void tx;

  const { data: reservation } = await supabaseAdmin
    .from("reservations")
    .select("id, status, total_cents, paid_cents")
    .eq("id", reservationId)
    .single();
  const r = reservation as { id: string; status: string; total_cents: number; paid_cents: number } | null;
  if (!r) return;

  const newPaid = r.paid_cents + amountCents;
  const newStatus = newPaid >= r.total_cents ? "confirmed" : r.status === "cancelled" ? r.status : "confirmed";

  await supabaseAdmin
    .from("reservations")
    .update({ paid_cents: newPaid, status: newStatus, updated_at: new Date().toISOString() })
    .eq("id", reservationId);

  if (attemptId) {
    await supabaseAdmin
      .from("payment_attempts")
      .update({ status: "succeeded", updated_at: new Date().toISOString() })
      .eq("id", attemptId);
  }

  await queueOutboxJob(reservationId, "guest_confirmation", `reservation:${reservationId}`);
  await queueOutboxJob(reservationId, "internal_new_reservation", `reservation:${reservationId}`);
  await queueOutboxJob(reservationId, "payment_receipt", `payment:${providerTransactionId}`);
}

/** Queue a deduplicated outbox job. No-op if already queued. */
export async function queueOutboxJob(
  reservationId: string,
  kind: string,
  dedupKey: string,
): Promise<void> {
  await supabaseAdmin.from("outbox_jobs").insert({
    reservation_id: reservationId,
    kind,
    dedup_key: dedupKey,
    payload: { reservation_id: reservationId, queued_at: new Date().toISOString() },
    status: "queued",
  });
}

/** Process a verified Stripe webhook event. Idempotent. */
export async function processWebhookEvent(event: StripeWebhookEvent): Promise<void> {
  const { error: inboxErr } = await supabaseAdmin.from("inbound_events").insert({
    provider: "stripe",
    provider_event_id: event.id,
    event_type: event.type,
    payload: JSON.parse(JSON.stringify(event)) as Json,
    status: "processing",
  });
  if (inboxErr) return; // unique violation → already received

  try {
    const obj = event.data.object;
    const metadata = (obj["metadata"] ?? {}) as Record<string, string>;
    const reservationId = metadata["reservation_id"] ?? (obj["client_reference_id"] as string | undefined);

    if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
      const paymentIntent = (obj["payment_intent"] as string) ?? null;
      const amountTotal = (obj["amount_total"] as number) ?? 0;
      const currency = (obj["currency"] as string) ?? "usd";
      if (reservationId && paymentIntent) {
        await confirmReservationPayment(reservationId, paymentIntent, amountTotal, currency, "test");
      }
    } else if (event.type === "checkout.session.expired") {
      const sessionId = obj["id"] as string;
      await supabaseAdmin
        .from("payment_attempts")
        .update({ status: "expired", updated_at: new Date().toISOString() })
        .eq("provider_session_id", sessionId);
      // Do NOT release inventory here — reconcile provider state first (Stage 5 job).
    } else if (event.type === "payment_intent.payment_failed") {
      const intentId = obj["id"] as string;
      await supabaseAdmin
        .from("payment_attempts")
        .update({ status: "failed", updated_at: new Date().toISOString() })
        .eq("provider_payment_intent_id", intentId);
    } else if (event.type === "charge.refunded") {
      const refundId = obj["id"] as string;
      const paymentIntentId = (obj["payment_intent"] as string) ?? null;
      const amountRefunded = (obj["amount_refunded"] as number) ?? 0;
      if (paymentIntentId && reservationId) {
        await recordRefund(reservationId, paymentIntentId, refundId, amountRefunded, (obj["currency"] as string) ?? "usd");
      }
    }

    await supabaseAdmin
      .from("inbound_events")
      .update({ status: "processed", processed_at: new Date().toISOString() })
      .eq("provider", "stripe")
      .eq("provider_event_id", event.id);
  } catch (e) {
    await supabaseAdmin
      .from("inbound_events")
      .update({ status: "failed", error: (e as Error).message })
      .eq("provider", "stripe")
      .eq("provider_event_id", event.id);
    throw e;
  }
}

/** Record a refund. Idempotent by provider_refund_id. */
export async function recordRefund(
  reservationId: string,
  paymentIntentId: string,
  refundId: string,
  amountCents: number,
  currency: string,
): Promise<void> {
  const { data: tx } = await supabaseAdmin
    .from("payment_transactions")
    .select("id")
    .eq("provider_transaction_id", paymentIntentId)
    .single();
  const txRow = tx as { id: string } | null;
  if (!txRow) return;

  const { error } = await supabaseAdmin.from("refunds").insert({
    reservation_id: reservationId,
    payment_transaction_id: txRow.id,
    provider: "stripe",
    provider_refund_id: refundId,
    amount_cents: amountCents,
    currency: currency.toUpperCase(),
    status: "succeeded",
  });
  if (error) return; // unique violation → already recorded

  const { data: r } = await supabaseAdmin
    .from("reservations")
    .select("id, paid_cents")
    .eq("id", reservationId)
    .single();
  const reservation = r as { id: string; paid_cents: number } | null;
  if (reservation) {
    await supabaseAdmin
      .from("reservations")
      .update({ paid_cents: Math.max(0, reservation.paid_cents - amountCents), updated_at: new Date().toISOString() })
      .eq("id", reservationId);
  }
}

/** Staff-initiated refund. Idempotent. Prevents refunding more than collected. */
export async function staffRefund(
  supabase: SupabaseClient,
  userId: string,
  input: { reservation_id: string; amount_cents?: number | undefined; reason?: string | undefined },
): Promise<{ refund_id: string; status: string }> {
  const { data: staff } = await supabase.rpc("is_manager", { _user_id: userId });
  if (!staff) throw new Error("Manager role required to issue refunds.");

  const { data: r } = await supabase
    .from("reservations")
    .select("id, booking_reference, paid_cents, currency")
    .eq("id", input.reservation_id)
    .single();
  const reservation = r as { id: string; booking_reference: string; paid_cents: number; currency: string } | null;
  if (!reservation) throw new Error("Reservation not found.");

  const { data: tx } = await supabase
    .from("payment_transactions")
    .select("id, provider_transaction_id")
    .eq("reservation_id", input.reservation_id)
    .eq("status", "succeeded")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();
  const txRow = tx as { id: string; provider_transaction_id: string } | null;
  if (!txRow) throw new Error("No successful transaction to refund.");

  const refundAmount = input.amount_cents ?? reservation.paid_cents;
  if (refundAmount > reservation.paid_cents) {
    throw new Error("Refund amount exceeds collected funds.");
  }

  const idempotencyKey = `refund-${reservation.id}-${txRow.id}-${refundAmount}`;
  const refundParams: Parameters<typeof createRefund>[0] = {
    paymentIntentId: txRow.provider_transaction_id,
    amountCents: refundAmount,
    idempotencyKey,
    metadata: { reservation_id: reservation.id, booking_reference: reservation.booking_reference },
  };
  if (input.reason) refundParams.reason = input.reason;
  const stripeRefund = await createRefund(refundParams);

  await recordRefund(reservation.id, txRow.provider_transaction_id, stripeRefund.id, stripeRefund.amount, stripeRefund.currency);
  await queueOutboxJob(reservation.id, "refund_result", `refund:${stripeRefund.id}`);

  return { refund_id: stripeRefund.id, status: stripeRefund.status };
}

export { getStripeConfig };
