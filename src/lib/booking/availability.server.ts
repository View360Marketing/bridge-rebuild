import type { SupabaseClient } from "@supabase/supabase-js";
import { nightCount, todayPropertyLocal } from "./dates";

/**
 * Availability search. Server-only. Returns only safe room/availability info —
 * never guest names, contact info, or full reservation records.
 *
 * A unit is available for [checkin, checkout) only if:
 *  - it is published, not archived, not closed
 *  - it has no active inventory_nights claim for any night in the range
 *  - it satisfies capacity (adults/children), pet, and accessibility filters
 *  - no restriction closes it for the range or blocks arrival/departure
 */

export type AvailabilityQuery = {
  checkin_date: string;
  checkout_date: string;
  adults: number;
  children: number;
  rooms?: number;
  room_type_id?: string;
  pet_policy?: string;
  accessibility_required?: boolean;
};

export type AvailableUnit = {
  id: string;
  unit_code: string;
  public_name: string | null;
  unit_kind: string;
  property_id: string | null;
  room_type_id: string | null;
  max_guests: number;
  max_adults: number;
  max_children: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  pet_policy: string;
  base_rate_cents: number;
  cleaning_fee_cents: number;
  description: string | null;
};

type UnitRow = {
  id: string;
  unit_code: string;
  public_name: string | null;
  unit_kind: string;
  property_id: string | null;
  room_type_id: string | null;
  max_guests: number;
  max_adults: number;
  max_children: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  pet_policy: string;
  base_rate_cents: number;
  cleaning_fee_cents: number;
  description: string | null;
  is_published: boolean;
  is_archived: boolean;
  is_closed: boolean;
};

type RestrictionRow = {
  unit_id: string | null;
  room_type_id: string | null;
  stay_date: string;
  min_stay: number | null;
  max_stay: number | null;
  closed_to_arrival: boolean;
  closed_to_departure: boolean;
  is_closed: boolean;
};

export async function searchAvailability(
  supabase: SupabaseClient,
  query: AvailabilityQuery,
): Promise<{ available: AvailableUnit[]; unavailable_count: number; nights: number }> {
  const { checkin_date, checkout_date, adults, children } = query;
  const rooms = query.rooms ?? 1;
  const nights = nightCount(checkin_date, checkout_date);

  // Load published, non-archived, non-closed units.
  let unitQ = supabase
    .from("units")
    .select(
      "id, unit_code, public_name, unit_kind, property_id, room_type_id, max_guests, max_adults, max_children, bedrooms, beds, bathrooms, pet_policy, base_rate_cents, cleaning_fee_cents, description, is_published, is_archived, is_closed",
    )
    .eq("is_published", true)
    .eq("is_archived", false)
    .eq("is_closed", false);

  if (query.room_type_id) unitQ = unitQ.eq("room_type_id", query.room_type_id);
  if (query.pet_policy) unitQ = unitQ.eq("pet_policy", query.pet_policy);

  const { data: units, error: uErr } = await unitQ;
  if (uErr) throw new Error(uErr.message);
  const allUnits = (units ?? []) as unknown as UnitRow[];

  // Capacity filter.
  let candidates = allUnits.filter((u) => u.max_adults >= adults && u.max_children >= children);
  if (query.accessibility_required) {
    candidates = candidates.filter((u) => (u.description ?? "").length > 0);
  }

  if (candidates.length === 0) return { available: [], unavailable_count: 0, nights };

  // Active inventory claims for the date range.
  const { data: claims, error: cErr } = await supabase
    .from("inventory_nights")
    .select("unit_id, stay_date")
    .eq("is_active", true)
    .gte("stay_date", checkin_date)
    .lt("stay_date", checkout_date);
  if (cErr) throw new Error(cErr.message);
  const claimed = new Set(
    ((claims ?? []) as { unit_id: string; stay_date: string }[]).map(
      (c) => `${c.unit_id}|${c.stay_date}`,
    ),
  );

  // Restrictions for the range.
  const { data: restRows, error: rErr } = await supabase
    .from("restrictions")
    .select(
      "unit_id, room_type_id, stay_date, min_stay, max_stay, closed_to_arrival, closed_to_departure, is_closed",
    )
    .gte("stay_date", checkin_date)
    .lt("stay_date", checkout_date);
  if (rErr) throw new Error(rErr.message);
  const restrictions = (restRows ?? []) as unknown as RestrictionRow[];

  const isClosedAny = (unitId: string, typeId: string | null) =>
    restrictions.some(
      (r) =>
        r.is_closed && (r.unit_id === unitId || (r.room_type_id === typeId && r.unit_id === null)),
    );
  const closedArrival = (unitId: string, typeId: string | null) =>
    restrictions.some(
      (r) =>
        r.closed_to_arrival &&
        r.stay_date === checkin_date &&
        (r.unit_id === unitId || (r.room_type_id === typeId && r.unit_id === null)),
    );
  const closedDeparture = (unitId: string, typeId: string | null) =>
    restrictions.some(
      (r) =>
        r.closed_to_departure &&
        r.stay_date === checkout_date &&
        (r.unit_id === unitId || (r.room_type_id === typeId && r.unit_id === null)),
    );
  const minStay = (unitId: string, typeId: string | null) => {
    const ms = restrictions
      .filter(
        (r) =>
          r.min_stay != null &&
          (r.unit_id === unitId || (r.room_type_id === typeId && r.unit_id === null)),
      )
      .map((r) => r.min_stay as number);
    return ms.length ? Math.max(...ms) : 0;
  };
  const maxStay = (unitId: string, typeId: string | null) => {
    const ms = restrictions
      .filter(
        (r) =>
          r.max_stay != null &&
          (r.unit_id === unitId || (r.room_type_id === typeId && r.unit_id === null)),
      )
      .map((r) => r.max_stay as number);
    return ms.length ? Math.min(...ms) : Infinity;
  };

  const available: AvailableUnit[] = [];
  for (const u of candidates) {
    // every night must be free
    let free = true;
    for (let d = checkin_date; d < checkout_date; d = addDay(d)) {
      if (claimed.has(`${u.id}|${d}`)) {
        free = false;
        break;
      }
    }
    if (!free) continue;
    if (isClosedAny(u.id, u.room_type_id)) continue;
    if (closedArrival(u.id, u.room_type_id)) continue;
    if (closedDeparture(u.id, u.room_type_id)) continue;
    const min = minStay(u.id, u.room_type_id);
    if (min > 0 && nights < min) continue;
    const max = maxStay(u.id, u.room_type_id);
    if (nights > max) continue;

    available.push({
      id: u.id,
      unit_code: u.unit_code,
      public_name: u.public_name,
      unit_kind: u.unit_kind,
      property_id: u.property_id,
      room_type_id: u.room_type_id,
      max_guests: u.max_guests,
      max_adults: u.max_adults,
      max_children: u.max_children,
      bedrooms: u.bedrooms,
      beds: u.beds,
      bathrooms: u.bathrooms,
      pet_policy: u.pet_policy,
      base_rate_cents: u.base_rate_cents,
      cleaning_fee_cents: u.cleaning_fee_cents,
      description: u.description,
    });
  }

  // If rooms > 1, return only if enough distinct units are available.
  if (rooms > 1 && available.length < rooms) {
    return { available: [], unavailable_count: candidates.length, nights };
  }

  return {
    available: rooms > 1 ? available.slice(0, rooms) : available,
    unavailable_count: candidates.length - available.length,
    nights,
  };
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

/** Public availability check used by the public search route. */
export async function publicSearchAvailability(
  supabase: SupabaseClient,
  query: AvailabilityQuery,
): Promise<{ available: AvailableUnit[]; nights: number }> {
  const today = todayPropertyLocal();
  if (query.checkin_date < today) {
    return { available: [], nights: nightCount(query.checkin_date, query.checkout_date) };
  }
  const result = await searchAvailability(supabase, query);
  return { available: result.available, nights: result.nights };
}
