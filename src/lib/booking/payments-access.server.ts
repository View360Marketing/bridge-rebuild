import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { randomToken, sha256, runIdempotent } from "./idempotency";
import { generateBookingReference } from "./dates";
import { queueOutboxJob } from "./payments-confirm.server";

/**
 * Secure guest reservation access — server-only.
 *
 * A booking reference / surname / email alone never grants access. Access is
 * via a cryptographically random capability token (hash stored, raw token
 * delivered once through the email workflow in Stage 5) or a verified
 * authenticated account that owns the reservation.
 */

/** Create a reservation access capability. Returns the raw token ONCE. */
export async function createAccessCapability(
  reservationId: string,
  scope = "guest",
  label?: string,
): Promise<{ token: string; expires_at: string }> {
  const token = randomToken(32);
  const tokenHash = await sha256(token);
  const expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60_000).toISOString();

  const insertRow: {
    reservation_id: string;
    token_hash: string;
    scope: string;
    expires_at: string;
    label?: string;
  } = {
    reservation_id: reservationId,
    token_hash: tokenHash,
    scope,
    expires_at: expiresAt,
  };
  if (label) insertRow.label = label;
  await supabaseAdmin.from("reservation_access_capabilities").insert(insertRow);

  return { token, expires_at: expiresAt };
}

/** Exchange a raw token for a reservation ID. Verifies hash, expiry, revocation. */
export async function resolveAccessCapability(
  token: string,
): Promise<{ reservation_id: string; scope: string } | null> {
  if (!token || token.length < 16) return null;
  const tokenHash = await sha256(token);

  const { data: cap } = await supabaseAdmin
    .from("reservation_access_capabilities")
    .select("id, reservation_id, scope, expires_at, revoked_at")
    .eq("token_hash", tokenHash)
    .single();
  const c = cap as {
    id: string;
    reservation_id: string;
    scope: string;
    expires_at: string;
    revoked_at: string | null;
  } | null;
  if (!c) return null;
  if (c.revoked_at) return null;
  if (c.expires_at && new Date(c.expires_at) < new Date()) return null;

  await supabaseAdmin
    .from("reservation_access_capabilities")
    .update({ last_used_at: new Date().toISOString() })
    .eq("id", c.id);

  return { reservation_id: c.reservation_id, scope: c.scope };
}

/**
 * Create a guest reservation (public flow). Acquires inventory atomically,
 * then creates an access capability. Does NOT confirm — payment is required.
 * Idempotent by the guest session idempotency key.
 */
export async function createGuestReservation(input: {
  guest_name: string;
  guest_email: string;
  guest_phone?: string | undefined;
  checkin_date: string;
  checkout_date: string;
  adults: number;
  children: number;
  units: {
    unit_id: string;
    checkin_date: string;
    checkout_date: string;
    adults: number;
    children: number;
  }[];
  total_cents: number;
  policy_version?: string | undefined;
  idempotency_key: string;
}): Promise<{ reservation_id: string; booking_reference: string; access_token: string }> {
  const bookingReference = generateBookingReference();
  const holdExpiresAt = new Date(Date.now() + 30 * 60_000).toISOString();

  const result = await runIdempotent(
    supabaseAdmin,
    { key: input.idempotency_key, scope: "guest_booking", operation: "create_guest_reservation" },
    input,
    async () => {
      const { data, error } = await supabaseAdmin.rpc("acquire_inventory", {
        p_booking_reference: bookingReference,
        p_guest_name: input.guest_name,
        p_guest_email: input.guest_email,
        p_guest_phone: input.guest_phone ?? "",
        p_source: "direct",
        p_status: "held",
        p_currency: "USD",
        p_total_cents: input.total_cents,
        ...(input.policy_version ? { p_policy_version: input.policy_version } : {}),
        p_hold_expires_at: holdExpiresAt,
        p_checkin_date: input.checkin_date,
        p_checkout_date: input.checkout_date,
        p_adults: input.adults,
        p_children: input.children,
        p_units: JSON.stringify(input.units),
        p_owner_type: "reservation",
        // p_created_by and p_group_id omitted -> SQL DEFAULT NULL
      });
      if (error) throw new Error(error.message);
      const res = data as { reservation_id: string; booking_reference: string; status: string };
      const cap = await createAccessCapability(res.reservation_id, "guest", "guest_link");
      return {
        reservation_id: res.reservation_id,
        booking_reference: res.booking_reference,
        access_token: cap.token,
      };
    },
  );

  return result;
}

/** Guest-initiated cancellation. Releases inventory; refund is a separate staff action. */
export async function guestCancelReservation(
  supabase: SupabaseClient,
  reservationId: string,
): Promise<void> {
  const { error } = await supabaseAdmin.rpc("release_reservation", {
    p_reservation_id: reservationId,
  });
  if (error) throw new Error(error.message);
  await supabaseAdmin
    .from("reservations")
    .update({
      status: "cancelled",
      cancelled_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", reservationId);
  await queueOutboxJob(reservationId, "cancellation", `cancel:${reservationId}`);
}
