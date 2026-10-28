import type { SupabaseClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { parseIcal, toLocalDate, toIcalDate, addDay, type ParsedVEvent } from "./ical-parser";
import { fetchIcalFeed } from "./ical-fetch";

export type ImportOutcome = {
  unit_id: string;
  unit_code: string;
  status: "success" | "failed" | "skipped" | "stale";
  imported: number;
  updated: number;
  cancelled: number;
  raw_events: number;
  error?: string;
};

/**
 * Import a single unit's Airbnb iCal feed. Acquires 'airbnb' blocks for each
 * event night through the dedicated claim_external_block RPC so they conflict
 * with direct bookings in availability search. Reconciliation:
 *  - New events -> insert ical_imported_events + claim nights.
 *  - Changed events -> reconcile_external_event (release old + claim new in
 *    one transaction; a conflict rolls back, preserving the original blocks).
 *  - Missing events -> mark stale (don't release; feed may be incomplete).
 *  - Cancelled events -> release their nights via release_external_block.
 *  - A fetch failure preserves existing blocks (stale, not empty).
 */
export async function syncUnitIcal(
  supabase: SupabaseClient,
  unitId: string,
  feedUrl: string,
): Promise<ImportOutcome> {
  const { data: unit } = await supabase
    .from("units")
    .select("id, unit_code")
    .eq("id", unitId)
    .single();
  if (!unit) throw new Error("Unit not found");
  const unitCode = unit.unit_code as string;

  const { data: logRow } = await supabaseAdmin
    .from("ical_sync_log")
    .insert({ unit_id: unitId, feed_url: feedUrl, status: "running" })
    .select("id")
    .single();
  const logId = logRow?.id;

  let text: string;
  try {
    text = await fetchIcalFeed(feedUrl);
  } catch (e) {
    const msg = (e as Error).message;
    if (logId) {
      await supabaseAdmin
        .from("ical_sync_log")
        .update({ status: "failed", error_message: msg, finished_at: new Date().toISOString() })
        .eq("id", logId);
    }
    // Record the attempt timestamp but do NOT update ical_last_synced_at —
    // a failed or invalid feed must not make availability look fresh.
    await supabaseAdmin
      .from("units")
      .update({ ical_sync_status: "error", ical_last_attempt_at: new Date().toISOString() })
      .eq("id", unitId);
    return {
      unit_id: unitId,
      unit_code: unitCode,
      status: "failed",
      imported: 0,
      updated: 0,
      cancelled: 0,
      raw_events: 0,
      error: msg,
    };
  }

  const events = parseIcal(text);

  const { data: existing } = await supabaseAdmin
    .from("ical_imported_events")
    .select("id, feed_uid, ical_uid, status, dtstart, dtend")
    .eq("unit_id", unitId);
  const existingMap = new Map((existing ?? []).map((e) => [e.feed_uid as string, e]));

  const seenUids = new Set<string>();
  let imported = 0;
  let updated = 0;
  let cancelled = 0;

  for (const ev of events) {
    seenUids.add(ev.uid);
    const checkin = toLocalDate(ev.dtstart);
    const checkout = toLocalDate(ev.dtend);
    if (!checkin || !checkout || checkout <= checkin) continue;

    const prev = existingMap.get(ev.uid);
    const status = ev.status === "cancelled" ? "cancelled" : "confirmed";

    if (prev) {
      if (status === "cancelled" && prev.status !== "cancelled") {
        // Cancellation: release this event's own nights by source_uid.
        await releaseAirbnbNightsByUid(unitId, ev.uid);
        await supabaseAdmin
          .from("ical_imported_events")
          .update({ status: "cancelled", imported_at: new Date().toISOString() })
          .eq("id", prev.id);
        cancelled++;
      } else if (status === "confirmed") {
        // Transactional amendment via reconcile_external_event: releases the
        // event's OLD nights AND claims the NEW nights in one SQL
        // transaction. If any new night conflicts with a direct booking, the
        // whole call rolls back — old nights stay intact (the original
        // booking is preserved). No half-moved inventory.
        const prevStart = prev.dtstart ? new Date(prev.dtstart as string).toISOString() : null;
        const prevEnd = prev.dtend ? new Date(prev.dtend as string).toISOString() : null;
        const datesChanged = prevStart !== ev.dtstart || prevEnd !== ev.dtend;
        if (datesChanged) {
          await reconcileAirbnbEvent(unitId, ev.uid, checkin, checkout);
          updated++;
        }
        await supabaseAdmin
          .from("ical_imported_events")
          .update({
            summary: ev.summary,
            dtstart: ev.dtstart,
            dtend: ev.dtend,
            status: "confirmed",
            imported_at: new Date().toISOString(),
          })
          .eq("id", prev.id);
      }
    } else if (status === "confirmed") {
      await claimAirbnbNights(unitId, ev.uid, checkin, checkout);
      await supabaseAdmin.from("ical_imported_events").insert({
        unit_id: unitId,
        feed_uid: ev.uid,
        ical_uid: ev.uid,
        summary: ev.summary,
        dtstart: ev.dtstart,
        dtend: ev.dtend,
        status: "confirmed",
        source: "airbnb",
      });
      imported++;
    }
  }

  // Mark vanished events stale (don't release; feed may be incomplete)
  for (const [uid, ev] of existingMap.entries()) {
    if (!seenUids.has(uid) && ev.status === "confirmed") {
      await supabaseAdmin.from("ical_imported_events").update({ status: "stale" }).eq("id", ev.id);
    }
  }

  if (logId) {
    await supabaseAdmin
      .from("ical_sync_log")
      .update({
        status: "success",
        imported_count: imported,
        updated_count: updated,
        cancelled_count: cancelled,
        raw_event_count: events.length,
        finished_at: new Date().toISOString(),
      })
      .eq("id", logId);
  }
  // Only update ical_last_synced_at on a successful reconciliation.
  await supabaseAdmin
    .from("units")
    .update({
      ical_sync_status: "synced",
      ical_last_synced_at: new Date().toISOString(),
      ical_last_attempt_at: new Date().toISOString(),
    })
    .eq("id", unitId);

  return {
    unit_id: unitId,
    unit_code: unitCode,
    status: "success",
    imported,
    updated,
    cancelled,
    raw_events: events.length,
  };
}

// Source UID used as the claim_reason key for external (Airbnb) blocks.
// This is an explicit event-to-block relationship, not reason-text matching.
const AIRBNB_REASON = (icalUid: string) => icalUid;

/** Acquire Airbnb-imported nights via the dedicated claim_external_block RPC. */
async function claimAirbnbNights(
  unitId: string,
  icalUid: string,
  checkin: string,
  checkout: string,
): Promise<void> {
  const reason = AIRBNB_REASON(icalUid);
  const { error } = await supabaseAdmin.rpc("claim_external_block", {
    p_unit_id: unitId,
    p_checkin_date: checkin,
    p_checkout_date: checkout,
    p_owner_type: "airbnb",
    p_source_uid: reason,
  });
  if (
    error &&
    !error.message.includes("already claimed") &&
    !error.message.includes("conflict") &&
    !error.message.includes("duplicate")
  ) {
    throw error;
  }
}

/** Release Airbnb-imported nights for this event via the dedicated release_external_block RPC. */
async function releaseAirbnbNightsByUid(unitId: string, icalUid: string): Promise<void> {
  const reason = AIRBNB_REASON(icalUid);
  const { error } = await supabaseAdmin.rpc("release_external_block", {
    p_unit_id: unitId,
    p_source_uid: reason,
  });
  if (error) throw error;
}

/**
 * Transactional amendment for an imported event: release this event's old
 * nights + claim new nights in a single SQL call (reconcile_external_event).
 * A unique-index conflict on any new night aborts the whole call and rolls
 * back the release, so the original blocks are preserved (failed amendment
 * never leaves the room half-moved).
 */
async function reconcileAirbnbEvent(
  unitId: string,
  icalUid: string,
  checkin: string,
  checkout: string,
): Promise<void> {
  const reason = AIRBNB_REASON(icalUid);
  const { error } = await supabaseAdmin.rpc("reconcile_external_event", {
    p_unit_id: unitId,
    p_source_uid: reason,
    p_checkin_date: checkin,
    p_checkout_date: checkout,
    p_owner_type: "airbnb",
  });
  if (
    error &&
    !error.message.includes("already claimed") &&
    !error.message.includes("conflict") &&
    !error.message.includes("duplicate")
  ) {
    throw error;
  }
}

// ── Export (website -> Airbnb) ─────────────────────────────────────────────

export async function buildUnitIcsExport(unitId: string, token: string): Promise<string | null> {
  const { data: unit } = await supabaseAdmin
    .from("units")
    .select("id, unit_code, ical_export_token")
    .eq("id", unitId)
    .single();
  if (!unit || unit.ical_export_token !== token) return null;

  // Fetch active inventory nights for this unit (exclude airbnb-imported to
  // prevent circular sync). For reservation-owned nights, join the
  // reservations table to get the authoritative status — a paid booking
  // whose inventory_nights.claim_reason is still "held" must still export.
  const { data: nights, error } = await supabaseAdmin
    .from("inventory_nights")
    .select("stay_date, owner_type, claim_reason, owner_id")
    .eq("unit_id", unitId)
    .eq("is_active", true)
    .neq("owner_type", "airbnb");
  if (error) throw new Error(error.message);

  // Fetch authoritative reservation statuses for the owner_ids that are
  // reservation-type, so we can decide export eligibility correctly.
  const reservationOwnerIds = (nights ?? [])
    .filter((n) => (n as NightRow).owner_type === "reservation" && (n as NightRow).owner_id)
    .map((n) => (n as NightRow).owner_id as string);
  const reservationStatusMap = new Map<string, string>();
  if (reservationOwnerIds.length > 0) {
    const { data: resRows } = await supabaseAdmin
      .from("reservations")
      .select("id, status")
      .in("id", reservationOwnerIds);
    for (const r of (resRows ?? []) as { id: string; status: string }[]) {
      reservationStatusMap.set(r.id, r.status);
    }
  }

  // Group contiguous nights by reservation/block.
  type NightRow = {
    stay_date: string;
    owner_type: string;
    claim_reason: string | null;
    owner_id: string | null;
  };
  const byOwner = new Map<string, { dates: string[]; owner_type: string }>();
  for (const n of (nights ?? []) as unknown as NightRow[]) {
    if (n.owner_type === "reservation") {
      // Use the authoritative reservation status to decide export eligibility.
      // Only export reservations that are confirmed, checked_in, or checked_out.
      // Pending/hold/draft/cancelled/expired reservations are not exported.
      const resStatus = n.owner_id ? reservationStatusMap.get(n.owner_id) : undefined;
      if (resStatus !== "confirmed" && resStatus !== "checked_in" && resStatus !== "checked_out") {
        continue;
      }
    }
    const key = n.owner_id ?? n.claim_reason ?? n.owner_type;
    const existing = byOwner.get(key);
    if (existing) {
      existing.dates.push(n.stay_date);
    } else {
      byOwner.set(key, { dates: [n.stay_date], owner_type: n.owner_type });
    }
  }

  const events: { uid: string; dtstart: string; dtend: string; summary: string }[] = [];
  for (const [, entry] of byOwner.entries()) {
    const sorted = [...entry.dates].sort();
    let rangeStart = sorted[0] ?? "";
    let prev = rangeStart;
    for (let i = 1; i < sorted.length; i++) {
      const cur = sorted[i] ?? "";
      if (cur === addDay(prev)) {
        prev = cur;
      } else {
        events.push({
          uid: `bridges-${unitId}-${rangeStart}`,
          dtstart: toIcalDate(rangeStart),
          dtend: toIcalDate(addDay(prev)),
          summary: entry.owner_type === "reservation" ? "Unavailable" : "Blocked",
        });
        rangeStart = cur;
        prev = cur;
      }
    }
    events.push({
      uid: `bridges-${unitId}-${rangeStart}`,
      dtstart: toIcalDate(rangeStart),
      dtend: toIcalDate(addDay(prev)),
      summary: entry.owner_type === "reservation" ? "Unavailable" : "Blocked",
    });
  }

  const now = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//The Bridges//Reservation Export//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:The Bridges ${unit.unit_code}`,
  ];
  for (const ev of events) {
    lines.push(
      "BEGIN:VEVENT",
      `UID:${ev.uid}`,
      `DTSTAMP:${now}`,
      `DTSTART;VALUE=DATE:${ev.dtstart}`,
      `DTEND;VALUE=DATE:${ev.dtend}`,
      `SUMMARY:${ev.summary}`,
      "END:VEVENT",
    );
  }
  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

// ── Scheduler / freshness ──────────────────────────────────────────────────

export async function runScheduledSync(): Promise<ImportOutcome[]> {
  const { data: settings } = await supabaseAdmin
    .from("integration_settings")
    .select("ical_sync_enabled")
    .eq("id", 1)
    .single();
  if (!settings?.ical_sync_enabled) return [];

  const { data: units } = await supabaseAdmin
    .from("units")
    .select("id, unit_code, ical_import_url")
    .not("ical_import_url", "is", null)
    .neq("ical_import_url", "");
  const queue = (units ?? []) as { id: string; unit_code: string; ical_import_url: string }[];

  // Durable batching: bounded concurrency + a wall-clock budget so the run
  // stays within platform execution limits. Each fetch has a 15s timeout;
  // with CONCURRENCY=5 the worst-case batch is ~15s, and the overall budget
  // caps total runtime. Units that don't fit in the budget are left for the
  // next scheduled call (their last-known blocks are preserved).
  const CONCURRENCY = 5;
  const BUDGET_MS = 25_000; // keep well under typical Worker CPU/wall limits
  const startedAt = Date.now();
  const results: ImportOutcome[] = [];
  let index = 0;

  async function runOne(u: { id: string; unit_code: string; ical_import_url: string }) {
    try {
      results.push(await syncUnitIcal(supabaseAdmin, u.id, u.ical_import_url));
    } catch (e) {
      results.push({
        unit_id: u.id,
        unit_code: u.unit_code,
        status: "failed",
        imported: 0,
        updated: 0,
        cancelled: 0,
        raw_events: 0,
        error: (e as Error).message,
      });
    }
  }

  while (index < queue.length && Date.now() - startedAt < BUDGET_MS) {
    const batch = queue.slice(index, index + CONCURRENCY);
    index += batch.length;
    await Promise.all(batch.map(runOne));
  }
  // Any units skipped due to the time budget are intentionally left for the
  // next run; their existing imported blocks remain active.
  return results;
}

export async function checkIcalFreshness(): Promise<{ stale: string[] }> {
  const { data: settings } = await supabaseAdmin
    .from("integration_settings")
    .select("ical_stale_after_hours")
    .eq("id", 1)
    .single();
  const staleHours = settings?.ical_stale_after_hours ?? 24;
  const cutoff = new Date(Date.now() - staleHours * 3600_000).toISOString();
  const { data: staleUnits } = await supabaseAdmin
    .from("units")
    .select("id")
    .not("ical_import_url", "is", null)
    .neq("ical_import_url", "")
    .or(`ical_last_synced_at.is.null,ical_last_synced_at.lt.${cutoff}`);
  for (const u of staleUnits ?? []) {
    await supabaseAdmin
      .from("units")
      .update({ ical_sync_status: "stale" })
      .eq("id", (u as { id: string }).id);
  }
  return { stale: (staleUnits ?? []).map((u) => (u as { id: string }).id) };
}

export type IcalUnit = {
  id: string;
  unit_code: string;
  public_name: string | null;
  airbnb_listing_id: string | null;
  airbnb_url: string | null;
  ical_import_url: string | null;
  ical_export_token: string | null;
  ical_sync_status: string | null;
  ical_last_synced_at: string | null;
};

export async function listIcalUnits(supabase: SupabaseClient): Promise<IcalUnit[]> {
  const { data, error } = await supabase
    .from("units")
    .select(
      "id, unit_code, public_name, airbnb_listing_id, airbnb_url, ical_import_url, ical_export_token, ical_sync_status, ical_last_synced_at",
    )
    .order("sort_order, unit_code");
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as IcalUnit[];
}

export type IcalMappingInput = {
  unit_id: string;
  airbnb_listing_id?: string | null;
  airbnb_url?: string | null;
  ical_import_url?: string | null;
  ical_sync_enabled?: boolean | null;
};

export async function updateIcalMapping(
  supabase: SupabaseClient,
  input: IcalMappingInput,
): Promise<void> {
  const patch: Record<string, string | boolean | null> = {};
  if (input["airbnb_listing_id"] !== undefined)
    patch["airbnb_listing_id"] = input["airbnb_listing_id"] ?? null;
  if (input["airbnb_url"] !== undefined) patch["airbnb_url"] = input["airbnb_url"] ?? null;
  if (input["ical_import_url"] !== undefined)
    patch["ical_import_url"] = input["ical_import_url"] ?? null;
  if (input["ical_sync_enabled"] !== undefined) {
    if (input["ical_sync_enabled"]) {
      patch["ical_sync_status"] = "configured";
    } else if (input["ical_import_url"] === null || input["ical_import_url"] === "") {
      patch["ical_sync_status"] = "disabled";
    }
  }
  const { error } = await supabase.from("units").update(patch).eq("id", input.unit_id);
  if (error) throw new Error(error.message);
}

export async function regenerateExportToken(
  supabase: SupabaseClient,
  unitId: string,
): Promise<string> {
  const token = crypto.randomUUID();
  const { error } = await supabase
    .from("units")
    .update({ ical_export_token: token })
    .eq("id", unitId);
  if (error) throw new Error(error.message);
  return token;
}

export async function getSyncHistory(
  supabase: SupabaseClient,
  unitId: string,
  limit = 20,
): Promise<
  {
    id: string;
    status: string;
    started_at: string;
    finished_at: string | null;
    imported_count: number;
    updated_count: number;
    cancelled_count: number;
    raw_event_count: number;
    error_message: string | null;
  }[]
> {
  const { data, error } = await supabase
    .from("ical_sync_log")
    .select(
      "id, status, started_at, finished_at, imported_count, updated_count, cancelled_count, raw_event_count, error_message",
    )
    .eq("unit_id", unitId)
    .order("started_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as {
    id: string;
    status: string;
    started_at: string;
    finished_at: string | null;
    imported_count: number;
    updated_count: number;
    cancelled_count: number;
    raw_event_count: number;
    error_message: string | null;
  }[];
}

export async function getSyncSettings(supabase: SupabaseClient): Promise<{
  ical_sync_enabled: boolean;
  ical_sync_interval_minutes: number;
  ical_export_base_url: string | null;
  ical_stale_after_hours: number;
}> {
  const { data } = await supabase
    .from("integration_settings")
    .select(
      "ical_sync_enabled, ical_sync_interval_minutes, ical_export_base_url, ical_stale_after_hours",
    )
    .eq("id", 1)
    .single();
  return {
    ical_sync_enabled: data?.ical_sync_enabled ?? false,
    ical_sync_interval_minutes: data?.ical_sync_interval_minutes ?? 5,
    ical_export_base_url: data?.ical_export_base_url ?? null,
    ical_stale_after_hours: data?.ical_stale_after_hours ?? 24,
  };
}

export async function updateSyncSettings(
  supabase: SupabaseClient,
  patch: {
    ical_sync_enabled?: boolean;
    ical_sync_interval_minutes?: number;
    ical_export_base_url?: string | null;
    ical_stale_after_hours?: number;
  },
): Promise<void> {
  const { error } = await supabase.from("integration_settings").update(patch).eq("id", 1);
  if (error) throw new Error(error.message);
}
