import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { randomToken, sha256, runIdempotent } from "./idempotency";
import { generateBookingReference } from "./dates";
import { queueOutboxJob } from "./payments-confirm.server";
import { computeQuote, type QuoteInput } from "./pricing.server";
import { searchAvailability } from "./availability.server";

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
      // 1. Enforce booking-enabled and inventory authority.
      const { data: settings } = await supabaseAdmin
        .from("integration_settings")
        .select("instant_booking_enabled, inventory_authority")
        .eq("id", 1)
        .single();
      const s = settings as {
        instant_booking_enabled: boolean;
        inventory_authority: string;
      } | null;
      if (s && !s.instant_booking_enabled) {
        throw new Error("Instant booking is disabled. Use the request-to-book flow.");
      }

      // 2. Re-verify every requested unit is still available for the full stay.
      for (const u of input.units) {
        const avail = await searchAvailability(supabaseAdmin, {
          checkin_date: u.checkin_date,
          checkout_date: u.checkout_date,
          adults: u.adults,
          children: u.children,
          rooms: 1,
        });
        const stillFree = avail.available.some((a) => a.id === u.unit_id);
        if (!stillFree) {
          throw new Error(
            `Room ${u.unit_id} is no longer available for ${u.checkin_date}–${u.checkout_date}.`,
          );
        }
      }

      // 3. Recompute the authoritative total from trusted DB data. The
      //    client-supplied total is never trusted.
      // Fetch real unit data (unit_code, base_rate_cents, max capacity) so the
      // quote is computed from trusted DB values, not client-supplied totals.
      const unitIds = input.units.map((u) => u.unit_id);
      const { data: unitRows } = await supabaseAdmin
        .from("units")
        .select("id, unit_code, base_rate_cents, max_adults, max_children, room_type_id")
        .in("id", unitIds);
      const unitMap = new Map(
        (unitRows ?? []).map((r) => [
          (r as { id: string }).id,
          r as {
            unit_code: string;
            base_rate_cents: number;
            max_adults: number;
            max_children: number;
            room_type_id: string | null;
          },
        ]),
      );
      const quoteInput: QuoteInput = {
        units: input.units.map((u) => {
          const urow = unitMap.get(u.unit_id);
          return {
            unit_id: u.unit_id,
            unit_code: urow?.unit_code ?? "",
            base_rate_cents: urow?.base_rate_cents ?? 0,
            max_adults: urow?.max_adults ?? u.adults,
            max_children: urow?.max_children ?? 0,
            room_type_id: urow?.room_type_id ?? null,
          };
        }),
        checkin_date: input.checkin_date,
        checkout_date: input.checkout_date,
        adults: input.adults,
        children: input.children,
      };
      const quote = await computeQuote(supabaseAdmin, quoteInput);
      const authoritativeTotal = quote.total_cents;

      // 4. Reject stale iCal feeds: if any requested unit's last sync is older
      //    than the configured stale window, refuse to confirm.
      const staleHours = (await supabaseAdmin
        .from("integration_settings")
        .select("ical_stale_after_hours")
        .eq("id", 1)
        .single()) as { data: { ical_stale_after_hours: number } | null };
      const staleCutoff = new Date(
        Date.now() - (staleHours?.data?.ical_stale_after_hours ?? 24) * 3600_000,
      ).toISOString();
      const { data: staleUnits } = await supabaseAdmin
        .from("units")
        .select("id, unit_code")
        .in(
          "id",
          input.units.map((u) => u.unit_id),
        )
        .or(`ical_last_synced_at.is.null,ical_last_synced_at.lt.${staleCutoff}`);
      if (staleUnits && staleUnits.length > 0) {
        const names = (staleUnits as { unit_code: string }[]).map((u) => u.unit_code).join(", ");
        throw new Error(
          `Airbnb calendar for ${names} is stale (last sync older than ${staleHours?.data?.ical_stale_after_hours ?? 24}h). Refresh the iCal feed in Integrations before booking.`,
        );
      }

      // 5. Acquire inventory atomically with the server-computed total.
      const { data, error } = await supabaseAdmin.rpc("acquire_inventory", {
        p_booking_reference: bookingReference,
        p_guest_name: input.guest_name,
        p_guest_email: input.guest_email,
        p_guest_phone: input.guest_phone ?? "",
        p_source: "direct",
        p_status: "held",
        p_currency: "USD",
        p_total_cents: authoritativeTotal,
        ...(input.policy_version ? { p_policy_version: input.policy_version } : {}),
        p_hold_expires_at: holdExpiresAt,
        p_checkin_date: input.checkin_date,
        p_checkout_date: input.checkout_date,
        p_adults: input.adults,
        p_children: input.children,
        p_units: input.units,
        p_owner_type: "reservation",
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
