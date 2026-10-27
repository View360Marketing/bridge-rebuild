import type { SupabaseClient } from "@supabase/supabase-js";
import { todayPropertyLocal, addDays, parseDate } from "./dates";

/**
 * Reports — date-filtered operational and financial metrics.
 *
 * Definitions (shown in the UI):
 * - Occupancy = occupied sold room-nights / eligible sellable room-nights.
 *   Maintenance and owner blocks reduce the denominator (not sellable).
 *   Checkout holds are NOT sold nights.
 * - ADR = room revenue / stayed (sold) nights. Excludes taxes and non-room fees.
 * - RevPAR = room revenue / eligible room-nights.
 * - Cash receipts are not automatically earned room revenue.
 * - A deposit + its later balance are payments toward one reservation, not two room sales.
 */

export type ReportRange = { from: string; to: string };

export type OccupancyReport = {
  date: string;
  occupiedNights: number;
  eligibleNights: number;
  occupancyPct: number;
};

export type FinancialReport = {
  roomRevenueCents: number;
  occupiedNights: number;
  adrCents: number;
  revparCents: number;
  eligibleNights: number;
  taxesCollectedCents: number;
  paymentsCollectedCents: number;
  refundsCents: number;
  outstandingBalanceCents: number;
  cancellations: number;
  noShows: number;
};

export type SourceReport = {
  source: string;
  count: number;
  revenueCents: number;
};

export type ArrivalsDeparturesReport = {
  arrivals: number;
  departures: number;
};

export async function getOccupancyReport(
  supabase: SupabaseClient,
  range: ReportRange,
): Promise<OccupancyReport[]> {
  const dates: string[] = [];
  for (let d = range.from; d <= range.to; d = addDays(d, 1)) dates.push(d);

  const { data: units } = await supabase
    .from("units")
    .select("id")
    .eq("is_archived", false)
    .eq("is_closed", false);
  const unitIds = (units ?? []).map((u) => (u as { id: string }).id);
  const eligiblePerNight = unitIds.length;

  const { data: nights } = await supabase
    .from("inventory_nights")
    .select("unit_id, stay_date, owner_type, is_active")
    .eq("is_active", true)
    .gte("stay_date", range.from)
    .lte("stay_date", range.to);

  const { data: blocks } = await supabase
    .from("inventory_nights")
    .select("unit_id, stay_date, owner_type")
    .eq("is_active", true)
    .in("owner_type", ["maintenance", "owner"])
    .gte("stay_date", range.from)
    .lte("stay_date", range.to);

  const blockedSet = new Set(
    ((blocks ?? []) as { unit_id: string; stay_date: string }[]).map(
      (b) => `${b.unit_id}|${b.stay_date}`,
    ),
  );

  const reservedSet = new Set(
    ((nights ?? []) as { unit_id: string; stay_date: string; owner_type: string }[])
      .filter((n) => n.owner_type === "reservation")
      .map((n) => `${n.unit_id}|${n.stay_date}`),
  );

  return dates.map((date) => {
    let blocked = 0;
    let occupied = 0;
    for (const uid of unitIds) {
      if (blockedSet.has(`${uid}|${date}`)) blocked++;
      else if (reservedSet.has(`${uid}|${date}`)) occupied++;
    }
    const eligible = eligiblePerNight - blocked;
    return {
      date,
      occupiedNights: occupied,
      eligibleNights: eligible,
      occupancyPct: eligible > 0 ? Math.round((occupied / eligible) * 1000) / 10 : 0,
    };
  });
}

export async function getFinancialReport(
  supabase: SupabaseClient,
  range: ReportRange,
): Promise<FinancialReport> {
  // Room revenue: sum of reservation totals for stays overlapping the range,
  // allocated by nights in range. Excludes taxes and non-room fees.
  const { data: reservations } = await supabase
    .from("reservations")
    .select("id, total_cents, paid_cents, checkin_date, checkout_date, status, source")
    .gte("checkin_date", range.from)
    .lte("checkin_date", range.to)
    .in("status", ["confirmed", "checked_in", "checked_out"]);

  const resRows = (reservations ?? []) as {
    id: string;
    total_cents: number;
    paid_cents: number;
    checkin_date: string;
    checkout_date: string;
    status: string;
    source: string;
  }[];

  let roomRevenue = 0;
  let occupiedNights = 0;
  for (const r of resRows) {
    const nights = countNightsInRange(r.checkin_date, r.checkout_date, range.from, range.to);
    const totalNights = nightsBetween(r.checkin_date, r.checkout_date);
    if (totalNights > 0) {
      roomRevenue += Math.round((r.total_cents * nights) / totalNights);
      occupiedNights += nights;
    }
  }

  const { data: units } = await supabase
    .from("units")
    .select("id")
    .eq("is_archived", false)
    .eq("is_closed", false);
  const eligibleNights = (units ?? []).length * (countDaysInRange(range.from, range.to) + 1);

  const { data: payments } = await supabase
    .from("payment_transactions")
    .select("amount_cents, status")
    .gte("created_at", range.from + "T00:00:00Z")
    .lte("created_at", range.to + "T23:59:59Z");
  const paymentsCollected = ((payments ?? []) as { amount_cents: number; status: string }[])
    .filter((p) => p.status === "succeeded")
    .reduce((s, p) => s + p.amount_cents, 0);

  const { data: manualPayments } = await supabase
    .from("manual_payments")
    .select("amount_cents")
    .gte("collected_at", range.from + "T00:00:00Z")
    .lte("collected_at", range.to + "T23:59:59Z");
  const manualCollected = ((manualPayments ?? []) as { amount_cents: number }[]).reduce(
    (s, p) => s + p.amount_cents,
    0,
  );

  const { data: refunds } = await supabase
    .from("refunds")
    .select("amount_cents, status")
    .gte("created_at", range.from + "T00:00:00Z")
    .lte("created_at", range.to + "T23:59:59Z");
  const refundsTotal = ((refunds ?? []) as { amount_cents: number; status: string }[])
    .filter((r) => r.status === "succeeded")
    .reduce((s, r) => s + r.amount_cents, 0);

  const { data: cancelled } = await supabase
    .from("reservations")
    .select("id, status", { count: "exact", head: true })
    .eq("status", "cancelled")
    .gte("checkin_date", range.from)
    .lte("checkin_date", range.to);

  const { data: noShows } = await supabase
    .from("reservations")
    .select("id", { count: "exact", head: true })
    .eq("status", "no_show")
    .gte("checkin_date", range.from)
    .lte("checkin_date", range.to);

  const outstanding = resRows.reduce(
    (s, r) => s + Math.max(0, r.total_cents - r.paid_cents),
    0,
  );

  return {
    roomRevenueCents: roomRevenue,
    occupiedNights,
    adrCents: occupiedNights > 0 ? Math.round(roomRevenue / occupiedNights) : 0,
    revparCents: eligibleNights > 0 ? Math.round(roomRevenue / eligibleNights) : 0,
    eligibleNights,
    taxesCollectedCents: 0, // taxes are in quote snapshots; not separately tracked yet
    paymentsCollectedCents: paymentsCollected + manualCollected,
    refundsCents: refundsTotal,
    outstandingBalanceCents: outstanding,
    cancellations: cancelled?.length ?? 0,
    noShows: noShows?.length ?? 0,
  };
}

export async function getSourceReport(
  supabase: SupabaseClient,
  range: ReportRange,
): Promise<SourceReport[]> {
  const { data } = await supabase
    .from("reservations")
    .select("source, total_cents")
    .gte("checkin_date", range.from)
    .lte("checkin_date", range.to)
    .in("status", ["confirmed", "checked_in", "checked_out"]);
  const bySource = new Map<string, { count: number; revenueCents: number }>();
  for (const r of (data ?? []) as { source: string; total_cents: number }[]) {
    const cur = bySource.get(r.source) ?? { count: 0, revenueCents: 0 };
    cur.count++;
    cur.revenueCents += r.total_cents ?? 0;
    bySource.set(r.source, cur);
  }
  return [...bySource.entries()].map(([source, v]) => ({ source, ...v }));
}

export async function getArrivalsDeparturesReport(
  supabase: SupabaseClient,
  range: ReportRange,
): Promise<ArrivalsDeparturesReport> {
  const [arrRes, depRes] = await Promise.all([
    supabase
      .from("reservations")
      .select("id", { count: "exact", head: true })
      .gte("checkin_date", range.from)
      .lte("checkin_date", range.to)
      .in("status", ["confirmed", "checked_in", "checked_out"]),
    supabase
      .from("reservations")
      .select("id", { count: "exact", head: true })
      .gte("checkout_date", range.from)
      .lte("checkout_date", range.to)
      .in("status", ["checked_in", "checked_out"]),
  ]);
  return {
    arrivals: arrRes.count ?? 0,
    departures: depRes.count ?? 0,
  };
}

function nightsBetween(checkin: string, checkout: string): number {
  const c = parseDate(checkin).getTime();
  const o = parseDate(checkout).getTime();
  return Math.round((o - c) / 86_400_000);
}

function countNightsInRange(
  checkin: string,
  checkout: string,
  from: string,
  to: string,
): number {
  const start = parseDate(Math.max(parseDate(checkin).getTime(), parseDate(from).getTime()) === parseDate(checkin).getTime() ? checkin : from);
  const end = parseDate(Math.min(parseDate(checkout).getTime(), parseDate(addDays(to, 1)).getTime()) === parseDate(checkout).getTime() ? checkout : addDays(to, 1));
  const n = Math.round((end.getTime() - start.getTime()) / 86_400_000);
  return Math.max(0, n);
}

function countDaysInRange(from: string, to: string): number {
  return Math.round((parseDate(to).getTime() - parseDate(from).getTime()) / 86_400_000);
}

export { todayPropertyLocal, addDays };