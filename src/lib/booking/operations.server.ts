import type { SupabaseClient } from "@supabase/supabase-js";
import { todayPropertyLocal } from "./dates";

/**
 * Operations dashboard — real, date-filtered operational data.
 * Uses America/Chicago for operational date boundaries.
 * Empty production data produces zeros/empty states, not invented stats.
 */

export type OperationsStats = {
  date: string;
  arrivals: number;
  departures: number;
  inHouse: number;
  availableRooms: number;
  pendingHolds: number;
  outstandingBalanceCents: number;
  dirtyRooms: number;
  sameDayTurnovers: number;
  maintenanceBlocks: number;
  groupArrivals: number;
  paymentExceptions: number;
  notificationExceptions: number;
  // inventory reconciliation
  expectedRooms: number;
  configuredRooms: number;
  publishedRooms: number;
  closedRooms: number;
  sellableRooms: number;
};

export type ArrivalRow = {
  reservation_id: string;
  booking_reference: string;
  guest_name: string | null;
  unit_code: string | null;
  checkin_date: string;
  checkout_date: string;
  status: string;
  balance_cents: number;
};

export type DepartureRow = ArrivalRow;

export async function getOperationsStats(
  supabase: SupabaseClient,
  date?: string,
): Promise<OperationsStats> {
  const opDate = date ?? todayPropertyLocal();

  const [
    arrivalsRes,
    departuresRes,
    inHouseRes,
    unitsRes,
    holdsRes,
    outstandingRes,
    dirtyRes,
    turnoverRes,
    maintenanceRes,
    groupArrivalsRes,
    payExceptionsRes,
    notifExceptionsRes,
    settingsRes,
  ] = await Promise.all([
    supabase
      .from("reservations")
      .select("id", { count: "exact", head: true })
      .eq("checkin_date", opDate)
      .in("status", ["confirmed", "checked_in"]),
    supabase
      .from("reservations")
      .select("id", { count: "exact", head: true })
      .eq("checkout_date", opDate)
      .in("status", ["checked_in", "checked_out"]),
    supabase
      .from("reservations")
      .select("id", { count: "exact", head: true })
      .eq("status", "checked_in"),
    supabase.from("units").select("id, is_published, is_archived, is_closed, cleanliness_state"),
    supabase.from("reservations").select("id", { count: "exact", head: true }).eq("status", "held"),
    supabase
      .from("reservations")
      .select("total_cents, paid_cents")
      .in("status", ["confirmed", "checked_in", "pending_payment"]),
    supabase
      .from("units")
      .select("id", { count: "exact", head: true })
      .eq("cleanliness_state", "dirty")
      .eq("is_archived", false),
    supabase
      .from("housekeeping_tasks")
      .select("id", { count: "exact", head: true })
      .eq("task_date", opDate)
      .eq("is_turnover", true)
      .neq("status", "complete"),
    supabase
      .from("blocks")
      .select("id", { count: "exact", head: true })
      .eq("owner_type", "maintenance")
      .lte("checkin_date", opDate)
      .gt("checkout_date", opDate),
    supabase
      .from("groups")
      .select("id", { count: "exact", head: true })
      .eq("status", "active")
      .eq("checkin_date", opDate),
    supabase
      .from("payment_attempts")
      .select("id", { count: "exact", head: true })
      .eq("status", "exception"),
    supabase
      .from("outbox_jobs")
      .select("id", { count: "exact", head: true })
      .eq("status", "failed"),
    supabase.from("integration_settings").select("*").eq("id", 1).single(),
  ]);

  const units = (unitsRes.data ?? []) as {
    is_published: boolean;
    is_archived: boolean;
    is_closed: boolean;
    cleanliness_state: string;
  }[];

  const outstanding = (outstandingRes.data ?? []) as { total_cents: number; paid_cents: number }[];
  const outstandingBalance = outstanding.reduce(
    (sum, r) => sum + Math.max(0, (r.total_cents ?? 0) - (r.paid_cents ?? 0)),
    0,
  );

  const settings = settingsRes.data as {
    expected_room_count: number;
    inventory_authority: string;
    instant_booking_enabled: boolean;
  } | null;

  return {
    date: opDate,
    arrivals: arrivalsRes.count ?? 0,
    departures: departuresRes.count ?? 0,
    inHouse: inHouseRes.count ?? 0,
    availableRooms: units.filter(
      (u) => !u.is_archived && !u.is_closed && u.cleanliness_state !== "out_of_service",
    ).length,
    pendingHolds: holdsRes.count ?? 0,
    outstandingBalanceCents: outstandingBalance,
    dirtyRooms: dirtyRes.count ?? 0,
    sameDayTurnovers: turnoverRes.count ?? 0,
    maintenanceBlocks: maintenanceRes.count ?? 0,
    groupArrivals: groupArrivalsRes.count ?? 0,
    paymentExceptions: payExceptionsRes.count ?? 0,
    notificationExceptions: notifExceptionsRes.count ?? 0,
    expectedRooms: settings?.expected_room_count ?? 33,
    configuredRooms: units.filter((u) => !u.is_archived).length,
    publishedRooms: units.filter((u) => u.is_published && !u.is_archived).length,
    closedRooms: units.filter((u) => u.is_closed && !u.is_archived).length,
    sellableRooms: units.filter(
      (u) => !u.is_archived && !u.is_closed && u.cleanliness_state !== "out_of_service",
    ).length,
  };
}

export async function getArrivals(supabase: SupabaseClient, date?: string): Promise<ArrivalRow[]> {
  const opDate = date ?? todayPropertyLocal();
  const { data, error } = await supabase
    .from("reservations")
    .select(
      "id, booking_reference, checkin_date, checkout_date, status, total_cents, paid_cents, guests(name), reservation_units(units(unit_code))",
    )
    .eq("checkin_date", opDate)
    .in("status", ["confirmed", "checked_in"])
    .order("booking_reference");
  if (error) throw new Error(error.message);
  return (
    (data ?? []) as unknown as Array<{
      id: string;
      booking_reference: string;
      checkin_date: string;
      checkout_date: string;
      status: string;
      total_cents: number;
      paid_cents: number;
      guests: { name: string | null } | null;
      reservation_units: { units: { unit_code: string } | null }[];
    }>
  ).map((r) => ({
    reservation_id: r.id,
    booking_reference: r.booking_reference,
    guest_name: r.guests?.name ?? null,
    unit_code: r.reservation_units?.[0]?.units?.unit_code ?? null,
    checkin_date: r.checkin_date,
    checkout_date: r.checkout_date,
    status: r.status,
    balance_cents: Math.max(0, (r.total_cents ?? 0) - (r.paid_cents ?? 0)),
  }));
}

export async function getDepartures(
  supabase: SupabaseClient,
  date?: string,
): Promise<DepartureRow[]> {
  const opDate = date ?? todayPropertyLocal();
  const { data, error } = await supabase
    .from("reservations")
    .select(
      "id, booking_reference, checkin_date, checkout_date, status, total_cents, paid_cents, guests(name), reservation_units(units(unit_code))",
    )
    .eq("checkout_date", opDate)
    .in("status", ["checked_in", "checked_out"])
    .order("booking_reference");
  if (error) throw new Error(error.message);
  return (
    (data ?? []) as unknown as Array<{
      id: string;
      booking_reference: string;
      checkin_date: string;
      checkout_date: string;
      status: string;
      total_cents: number;
      paid_cents: number;
      guests: { name: string | null } | null;
      reservation_units: { units: { unit_code: string } | null }[];
    }>
  ).map((r) => ({
    reservation_id: r.id,
    booking_reference: r.booking_reference,
    guest_name: r.guests?.name ?? null,
    unit_code: r.reservation_units?.[0]?.units?.unit_code ?? null,
    checkin_date: r.checkin_date,
    checkout_date: r.checkout_date,
    status: r.status,
    balance_cents: Math.max(0, (r.total_cents ?? 0) - (r.paid_cents ?? 0)),
  }));
}
