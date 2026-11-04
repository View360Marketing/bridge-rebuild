import type { SupabaseClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

/**
 * Manual payments ledger — records funds already collected outside this website
 * (cash, check, external card terminal). Never triggers a Stripe charge.
 * Mistakes are corrected via audited reversal entries, not destructive edits.
 */

export type ManualPaymentRow = {
  id: string;
  reservation_id: string;
  amount_cents: number;
  currency: string;
  method: string;
  reference: string | null;
  collected_by: string;
  collected_at: string;
  notes: string | null;
  reverses_id: string | null;
};

export type ManualPaymentInput = {
  reservation_id: string;
  amount_cents: number;
  method: "cash" | "check" | "external_card" | "other";
  reference?: string;
  collected_at?: string;
  notes?: string;
};

async function requireStaff(_supabase: SupabaseClient, userId: string): Promise<void> {
  const { data } = await supabaseAdmin.rpc("is_staff", { _user_id: userId });
  if (!data) throw new Error("Staff role required for this operation.");
}

/** Record a manual payment collected outside this website. Idempotent by reference+amount+date. */
export async function recordManualPayment(
  supabase: SupabaseClient,
  userId: string,
  input: ManualPaymentInput,
): Promise<ManualPaymentRow> {
  await requireStaff(supabase, userId);
  if (input.amount_cents <= 0) throw new Error("Amount must be positive.");

  // Idempotency: if a payment with the same reference+amount+method+reservation exists, return it.
  if (input.reference) {
    const { data: existing } = await supabaseAdmin
      .from("manual_payments")
      .select("*")
      .eq("reservation_id", input.reservation_id)
      .eq("reference", input.reference)
      .eq("amount_cents", input.amount_cents)
      .eq("method", input.method)
      .is("reverses_id", null)
      .maybeSingle();
    if (existing) return existing as ManualPaymentRow;
  }

  const { data, error } = await supabaseAdmin
    .from("manual_payments")
    .insert({
      reservation_id: input.reservation_id,
      amount_cents: input.amount_cents,
      currency: "USD",
      method: input.method,
      reference: input.reference ?? null,
      collected_by: userId,
      collected_at: input.collected_at ?? new Date().toISOString(),
      notes: input.notes ?? null,
    })
    .select("*")
    .single();
  if (error) throw new Error(error.message);

  // Update reservation paid_cents (funds collected, not a charge).
  await updateReservationPaid(supabaseAdmin, input.reservation_id);

  return data as ManualPaymentRow;
}

/** Reverse a manual payment with an audited adjustment entry. Does not delete the original. */
export async function reverseManualPayment(
  supabase: SupabaseClient,
  userId: string,
  paymentId: string,
  reason?: string,
): Promise<ManualPaymentRow> {
  await requireStaff(supabase, userId);
  const { data: original, error: origErr } = await supabaseAdmin
    .from("manual_payments")
    .select("*")
    .eq("id", paymentId)
    .single();
  if (origErr || !original) throw new Error("Manual payment not found.");
  if ((original as ManualPaymentRow).reverses_id)
    throw new Error("Cannot reverse a reversal entry.");

  const orig = original as ManualPaymentRow;
  const { data, error } = await supabaseAdmin
    .from("manual_payments")
    .insert({
      reservation_id: orig.reservation_id,
      amount_cents: -orig.amount_cents,
      currency: orig.currency,
      method: orig.method,
      reference: `REVERSAL-${orig.id.slice(0, 8)}`,
      collected_by: userId,
      collected_at: new Date().toISOString(),
      notes: reason ?? `Reversal of ${orig.id}`,
      reverses_id: orig.id,
    })
    .select("*")
    .single();
  if (error) throw new Error(error.message);

  await updateReservationPaid(supabaseAdmin, orig.reservation_id);
  return data as ManualPaymentRow;
}

/** List manual payments for a reservation (including reversals). */
export async function listManualPayments(
  supabase: SupabaseClient,
  reservationId: string,
): Promise<ManualPaymentRow[]> {
  const { data, error } = await supabaseAdmin
    .from("manual_payments")
    .select("*")
    .eq("reservation_id", reservationId)
    .order("collected_at", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as ManualPaymentRow[];
}

/** Recompute paid_cents from manual_payments + payment_transactions for a reservation. */
export async function updateReservationPaid(
  client: typeof supabaseAdmin,
  reservationId: string,
): Promise<void> {
  const [manualRes, stripeRes] = await Promise.all([
    client.from("manual_payments").select("amount_cents").eq("reservation_id", reservationId),
    client
      .from("payment_transactions")
      .select("amount_cents")
      .eq("reservation_id", reservationId)
      .eq("status", "succeeded"),
  ]);
  const manual = (manualRes.data ?? []).reduce((s, r) => s + (r.amount_cents ?? 0), 0);
  const stripe = (stripeRes.data ?? []).reduce((s, r) => s + (r.amount_cents ?? 0), 0);
  const totalPaid = Math.max(0, manual + stripe);
  await client
    .from("reservations")
    .update({ paid_cents: totalPaid, updated_at: new Date().toISOString() })
    .eq("id", reservationId);
}
