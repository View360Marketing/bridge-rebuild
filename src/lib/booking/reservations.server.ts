import type { SupabaseClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { generateBookingReference, nightCount, todayPropertyLocal } from "./dates";

/**
 * Reservation operations — all run through the SECURITY DEFINER RPCs in the
 * database so the partial unique index on (unit_id, stay_date) WHERE is_active
 * enforces one active owner per room per night atomically.
 *
 * Every operation verifies the caller's staff role before invoking the RPC.
 */

export type ReservationStatus =
  | "draft"
  | "requested"
  | "held"
  | "pending_payment"
  | "confirmed"
  | "checked_in"
  | "checked_out"
  | "cancelled"
  | "expired"
  | "no_show"
  | "exception_needs_review";

export type CreateReservationInput = {
  guest_name: string;
  guest_email: string;
  guest_phone?: string;
  source?: string;
  status?: ReservationStatus;
  currency?: string;
  total_cents: number;
  policy_version?: string;
  hold_minutes?: number;
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
  group_id?: string;
};

export type CreateBlockInput = {
  unit_id: string;
  checkin_date: string;
  checkout_date: string;
  owner_type: "maintenance" | "owner" | "group";
  reason?: string;
  group_id?: string;
};

export type AmendInput = {
  reservation_id: string;
  units: {
    unit_id: string;
    checkin_date: string;
    checkout_date: string;
    adults: number;
    children: number;
  }[];
  checkin_date: string;
  checkout_date: string;
  total_cents: number;
  adults: number;
  children: number;
};

export type GroupPickupInput = {
  group_id: string;
  unit_id: string;
  checkin_date: string;
  checkout_date: string;
  guest_name: string;
  guest_email: string;
  guest_phone?: string;
  adults: number;
  children: number;
};

async function requireManager(supabase: SupabaseClient, userId: string): Promise<void> {
  const { data } = await supabase.rpc("is_manager", { _user_id: userId });
  if (!data) throw new Error("Manager role required for this operation.");
}

async function requireStaff(supabase: SupabaseClient, userId: string): Promise<void> {
  const { data } = await supabase.rpc("is_staff", { _user_id: userId });
  if (!data) throw new Error("Staff role required for this operation.");
}

/** Create a reservation with an atomic inventory hold. */
export async function createReservation(
  supabase: SupabaseClient,
  userId: string,
  input: CreateReservationInput,
): Promise<{ reservation_id: string; booking_reference: string; status: string }> {
  await requireStaff(supabase, userId);

  const bookingReference = generateBookingReference();
  const holdMinutes = input.hold_minutes ?? 30;
  const holdExpiresAt = new Date(Date.now() + holdMinutes * 60_000).toISOString();
  const status = input.status ?? "held";
  const source = input.source ?? "direct";
  const currency = input.currency ?? "USD";

  const { data, error } = await supabaseAdmin.rpc("acquire_inventory", {
    p_booking_reference: bookingReference,
    p_guest_name: input.guest_name,
    p_guest_email: input.guest_email,
    p_guest_phone: input.guest_phone ?? "",
    p_source: source,
    p_status: status,
    p_currency: currency,
    p_total_cents: input.total_cents,
    p_policy_version: (input.policy_version ?? null) as string,
    p_hold_expires_at: holdExpiresAt,
    p_checkin_date: input.checkin_date,
    p_checkout_date: input.checkout_date,
    p_adults: input.adults,
    p_children: input.children,
    p_created_by: userId,
    p_units: JSON.stringify(input.units),
    p_owner_type: "reservation",
    p_group_id: (input.group_id ?? null) as string,
  });
  if (error) throw new Error(error.message);
  return data as { reservation_id: string; booking_reference: string; status: string };
}

/** Create a maintenance/owner/group block. */
export async function createBlock(
  supabase: SupabaseClient,
  userId: string,
  input: CreateBlockInput,
): Promise<{ block_id: string }> {
  await requireManager(supabase, userId);
  const { data, error } = await supabaseAdmin.rpc("claim_block", {
    p_unit_id: input.unit_id,
    p_checkin_date: input.checkin_date,
    p_checkout_date: input.checkout_date,
    p_owner_type: input.owner_type,
    p_reason: (input.reason ?? null) as string,
    p_group_id: (input.group_id ?? null) as string,
    p_created_by: userId,
  });
  if (error) throw new Error(error.message);
  return data as { block_id: string };
}

/** Release a block (deactivate nights + remove block row). */
export async function releaseBlock(
  supabase: SupabaseClient,
  userId: string,
  blockId: string,
): Promise<void> {
  await requireManager(supabase, userId);
  const { error } = await supabaseAdmin.rpc("release_block", {
    p_block_id: blockId,
  });
  if (error) throw new Error(error.message);
}

/** Cancel a reservation and release its inventory. */
export async function cancelReservation(
  supabase: SupabaseClient,
  userId: string,
  reservationId: string,
): Promise<void> {
  await requireStaff(supabase, userId);
  const { error } = await supabaseAdmin.rpc("release_reservation", {
    p_reservation_id: reservationId,
  });
  if (error) throw new Error(error.message);
  await supabaseAdmin
    .from("reservations")
    .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
    .eq("id", reservationId);
}

/** Amend a reservation: atomic swap of units/dates. Old booking preserved if new allocation fails. */
export async function amendReservation(
  supabase: SupabaseClient,
  userId: string,
  input: AmendInput,
): Promise<{ reservation_id: string; status: string }> {
  await requireStaff(supabase, userId);
  const { data, error } = await supabaseAdmin.rpc("amend_reservation", {
    p_reservation_id: input.reservation_id,
    p_new_units: JSON.stringify(input.units),
    p_new_checkin: input.checkin_date,
    p_new_checkout: input.checkout_date,
    p_new_total_cents: input.total_cents,
    p_adults: input.adults,
    p_children: input.children,
    p_created_by: userId,
  });
  if (error) throw new Error(error.message);
  return data as { reservation_id: string; status: string };
}

/** Transfer a group's night claim to a reservation (guest pickup). */
export async function groupPickup(
  supabase: SupabaseClient,
  userId: string,
  input: GroupPickupInput,
): Promise<{ reservation_id: string; booking_reference: string }> {
  await requireStaff(supabase, userId);
  const bookingReference = generateBookingReference();
  const { data, error } = await supabaseAdmin.rpc("group_pickup", {
    p_group_id: input.group_id,
    p_unit_id: input.unit_id,
    p_checkin_date: input.checkin_date,
    p_checkout_date: input.checkout_date,
    p_booking_reference: bookingReference,
    p_guest_name: input.guest_name,
    p_guest_email: input.guest_email,
    p_guest_phone: input.guest_phone ?? "",
    p_adults: input.adults,
    p_children: input.children,
    p_created_by: userId,
  });
  if (error) throw new Error(error.message);
  return data as { reservation_id: string; booking_reference: string };
}

/** Check in a confirmed reservation. */
export async function checkIn(
  supabase: SupabaseClient,
  userId: string,
  reservationId: string,
): Promise<void> {
  await requireStaff(supabase, userId);
  const { error } = await supabase
    .from("reservations")
    .update({ status: "checked_in", updated_at: new Date().toISOString() })
    .eq("id", reservationId);
  if (error) throw new Error(error.message);
}

/** Check out a reservation. */
export async function checkOut(
  supabase: SupabaseClient,
  userId: string,
  reservationId: string,
): Promise<void> {
  await requireStaff(supabase, userId);
  const { error } = await supabase
    .from("reservations")
    .update({ status: "checked_out", updated_at: new Date().toISOString() })
    .eq("id", reservationId);
  if (error) throw new Error(error.message);
}

/** Mark a reservation as no-show (policy applies). */
export async function markNoShow(
  supabase: SupabaseClient,
  userId: string,
  reservationId: string,
): Promise<void> {
  await requireStaff(supabase, userId);
  const { error } = await supabase
    .from("reservations")
    .update({ status: "no_show", updated_at: new Date().toISOString() })
    .eq("id", reservationId);
  if (error) throw new Error(error.message);
}

/** List reservations with filters. Staff-only. */
export async function listReservations(
  supabase: SupabaseClient,
  filters: {
    status?: string;
    from?: string;
    to?: string;
    group_id?: string;
    search?: string;
    limit?: number;
    offset?: number;
  },
) {
  let q = supabase
    .from("reservations")
    .select(
      "id, booking_reference, guest_id, source, status, currency, total_cents, paid_cents, checkin_date, checkout_date, adults, children, group_id, version, created_at, guests(name, email, phone)",
    )
    .order("created_at", { ascending: false });

  if (filters.status) q = q.eq("status", filters.status);
  if (filters.from) q = q.gte("checkin_date", filters.from);
  if (filters.to) q = q.lte("checkout_date", filters.to);
  if (filters.group_id) q = q.eq("group_id", filters.group_id);
  if (filters.search) {
    q = q.or(`booking_reference.ilike.%${filters.search}%,guests.name.ilike.%${filters.search}%`);
  }
  if (filters.limit) q = q.limit(filters.limit);
  if (filters.offset) q = q.range(filters.offset, filters.offset + (filters.limit ?? 50) - 1);

  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return data ?? [];
}

/** Get a single reservation with units and guest. Staff-only. */
export async function getReservation(supabase: SupabaseClient, reservationId: string) {
  const { data, error } = await supabase
    .from("reservations")
    .select(
      "*, guests(name, email, phone), reservation_units(unit_id, checkin_date, checkout_date, adults, children, units(unit_code, public_name))",
    )
    .eq("id", reservationId)
    .single();
  if (error) throw new Error(error.message);
  return data;
}

/** List all active blocks. Staff-only. */
export async function listBlocks(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("blocks")
    .select("*, units(unit_code, public_name)")
    .order("checkin_date");
  if (error) throw new Error(error.message);
  return data ?? [];
}

/** Expire stale holds (held reservations past hold_expires_at). */
export async function expireStaleHolds(
  supabase: SupabaseClient,
  userId: string,
): Promise<{ expired: number }> {
  await requireManager(supabase, userId);
  const now = new Date().toISOString();
  const { data: stale, error: findErr } = await supabase
    .from("reservations")
    .select("id")
    .eq("status", "held")
    .lt("hold_expires_at", now);
  if (findErr) throw new Error(findErr.message);
  const ids = (stale ?? []).map((r) => r.id as string);
  let expired = 0;
  for (const id of ids) {
    const { error } = await supabaseAdmin.rpc("release_reservation", {
      p_reservation_id: id,
    });
    if (!error) {
      await supabaseAdmin
        .from("reservations")
        .update({ status: "expired", updated_at: now })
        .eq("id", id);
      expired++;
    }
  }
  return { expired };
}

/** Create a group (wedding/retreat allotment). Manager-only. */
export async function createGroup(
  supabase: SupabaseClient,
  userId: string,
  input: {
    name: string;
    contact_name?: string | undefined;
    contact_email?: string | undefined;
    contact_phone?: string | undefined;
    checkin_date?: string | undefined;
    checkout_date?: string | undefined;
    release_date?: string | undefined;
    payment_responsibility?: "organizer" | "guest" | undefined;
  },
): Promise<{ id: string; group_code: string }> {
  await requireManager(supabase, userId);
  const groupCode = `GRP-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  const { data, error } = await supabase
    .from("groups")
    .insert({
      name: input.name,
      contact_name: input.contact_name,
      contact_email: input.contact_email,
      contact_phone: input.contact_phone,
      group_code: groupCode,
      checkin_date: input.checkin_date,
      checkout_date: input.checkout_date,
      release_date: input.release_date,
      payment_responsibility: input.payment_responsibility ?? "organizer",
    })
    .select("id, group_code")
    .single();
  if (error) throw new Error(error.message);
  return data as { id: string; group_code: string };
}

/** List groups. Staff-only. */
export async function listGroups(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("groups")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

/** Release a group (mark released + deactivate its inventory nights). */
export async function releaseGroup(
  supabase: SupabaseClient,
  userId: string,
  groupId: string,
): Promise<void> {
  await requireManager(supabase, userId);
  await supabase
    .from("groups")
    .update({ status: "released", updated_at: new Date().toISOString() })
    .eq("id", groupId);
  const { error } = await supabaseAdmin
    .from("inventory_nights")
    .update({ is_active: false })
    .eq("group_id", groupId)
    .eq("owner_type", "group")
    .eq("is_active", true);
  if (error) throw new Error(error.message);
}

/** Calendar grid: rooms as rows, dates as columns, cell = status. */
export type CalendarCell = {
  unit_id: string;
  unit_code: string;
  public_name: string | null;
  date: string;
  status: "free" | "reservation" | "hold" | "block" | "group";
  reference?: string;
  owner_type?: string;
};

export async function buildCalendar(
  supabase: SupabaseClient,
  startDate: string,
  endDate: string,
): Promise<CalendarCell[]> {
  const { data: units, error: uErr } = await supabase
    .from("units")
    .select("id, unit_code, public_name")
    .eq("is_archived", false)
    .order("sort_order, unit_code");
  if (uErr) throw new Error(uErr.message);

  const { data: nights, error: nErr } = await supabase
    .from("inventory_nights")
    .select("unit_id, stay_date, owner_type, owner_id, claim_reason")
    .eq("is_active", true)
    .gte("stay_date", startDate)
    .lt("stay_date", endDate);
  if (nErr) throw new Error(nErr.message);

  const claimMap = new Map<
    string,
    { status: CalendarCell["status"]; reference?: string; owner_type?: string }
  >();
  for (const n of (nights ?? []) as {
    unit_id: string;
    stay_date: string;
    owner_type: string;
    owner_id: string;
    claim_reason: string;
  }[]) {
    const key = `${n.unit_id}|${n.stay_date}`;
    let status: CalendarCell["status"] = "free";
    if (n.owner_type === "reservation") status = n.claim_reason === "held" ? "hold" : "reservation";
    else if (n.owner_type === "group") status = "group";
    else if (n.owner_type === "maintenance" || n.owner_type === "owner") status = "block";
    claimMap.set(key, { status, owner_type: n.owner_type, reference: n.owner_id });
  }

  const cells: CalendarCell[] = [];
  for (const u of (units ?? []) as {
    id: string;
    unit_code: string;
    public_name: string | null;
  }[]) {
    for (let d = startDate; d < endDate; d = addDay(d)) {
      const key = `${u.id}|${d}`;
      const claim = claimMap.get(key);
      const cell: CalendarCell = {
        unit_id: u.id,
        unit_code: u.unit_code,
        public_name: u.public_name,
        date: d,
        status: claim?.status ?? "free",
      };
      if (claim?.reference) cell.reference = claim.reference;
      if (claim?.owner_type) cell.owner_type = claim.owner_type;
      cells.push(cell);
    }
  }
  return cells;
}

function addDay(s: string): string {
  const parts = s.split("-").map(Number);
  const y = parts[0] ?? 1970;
  const m = parts[1] ?? 1;
  const d = parts[2] ?? 1;
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + 1);
  const yy = dt.getUTCFullYear();
  const mm = String(dt.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(dt.getUTCDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

export { todayPropertyLocal, nightCount };
