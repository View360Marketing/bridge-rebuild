/**
 * Minimal RFC 5545 iCal parser. Handles folded lines (continuation with
 * leading space/tab), DATE and DATE-TIME values, and STATUS. Airbnb exports
 * all-day VEVENTs with DTSTART;DTEND as DATE values where DTEND is exclusive.
 */

export type ParsedVEvent = {
  uid: string;
  summary: string | null;
  dtstart: string; // ISO
  dtend: string; // ISO
  status: "confirmed" | "tentative" | "cancelled" | string;
};

export function parseIcal(text: string): ParsedVEvent[] {
  const unfolded = text.replace(/\r?\n[ \t]/g, "");
  const lines = unfolded.split(/\r?\n/);
  const events: ParsedVEvent[] = [];
  let inEvent = false;
  let cur: Partial<ParsedVEvent> = {};

  for (const line of lines) {
    if (line === "BEGIN:VEVENT") {
      inEvent = true;
      cur = {};
      continue;
    }
    if (line === "END:VEVENT") {
      if (inEvent && cur.uid && cur.dtstart && cur.dtend) {
        events.push({
          uid: cur.uid,
          summary: cur.summary ?? null,
          dtstart: cur.dtstart,
          dtend: cur.dtend,
          status: cur.status ?? "confirmed",
        });
      }
      inEvent = false;
      cur = {};
      continue;
    }
    if (!inEvent) continue;
    const colonIdx = line.indexOf(":");
    if (colonIdx < 0) continue;
    const keyFull = line.slice(0, colonIdx);
    const value = line.slice(colonIdx + 1);
    const key = keyFull.split(";")[0]?.toUpperCase() ?? keyFull.toUpperCase();
    const params = keyFull.split(";").slice(1).join(";");

    if (key === "UID") cur.uid = value;
    else if (key === "SUMMARY") cur.summary = value;
    else if (key === "STATUS") cur.status = value.toLowerCase();
    else if (key === "DTSTART") cur.dtstart = parseIcalDate(value, params);
    else if (key === "DTEND") cur.dtend = parseIcalDate(value, params);
  }
  return events;
}

function parseIcalDate(value: string, _params: string): string {
  const v = value.trim();
  if (/^\d{8}$/.test(v)) {
    const y = v.slice(0, 4);
    const m = v.slice(4, 6);
    const d = v.slice(6, 8);
    return `${y}-${m}-${d}T00:00:00Z`;
  }
  if (/^\d{8}T\d{6}$/.test(v)) {
    return `${v.slice(0, 4)}-${v.slice(4, 6)}-${v.slice(6, 8)}T${v.slice(9, 11)}:${v.slice(11, 13)}:${v.slice(13, 15)}Z`;
  }
  if (/^\d{8}T\d{6}Z$/.test(v)) {
    return `${v.slice(0, 4)}-${v.slice(4, 6)}-${v.slice(6, 8)}T${v.slice(9, 11)}:${v.slice(11, 13)}:${v.slice(13, 15)}Z`;
  }
  const dt = new Date(v);
  return Number.isNaN(dt.getTime()) ? v : dt.toISOString();
}

/** Convert an ISO datetime to a property-local date (America/Chicago). */
export function toLocalDate(iso: string): string {
  if (/^\d{4}-\d{2}-\d{2}T00:00:00Z$/.test(iso)) {
    return iso.slice(0, 10);
  }
  const dt = new Date(iso);
  if (Number.isNaN(dt.getTime())) return iso.slice(0, 10);
  try {
    const fmt = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Chicago",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const parts = fmt.formatToParts(dt);
    const y = parts.find((p) => p.type === "year")?.value ?? "1970";
    const m = parts.find((p) => p.type === "month")?.value ?? "01";
    const d = parts.find((p) => p.type === "day")?.value ?? "01";
    return `${y}-${m}-${d}`;
  } catch {
    return iso.slice(0, 10);
  }
}

export function toIcalDate(dateStr: string): string {
  return dateStr.replace(/-/g, "");
}

export function addDay(s: string): string {
  const parts = s.split("-").map(Number);
  const dt = new Date(Date.UTC(parts[0] ?? 1970, (parts[1] ?? 1) - 1, parts[2] ?? 1));
  dt.setUTCDate(dt.getUTCDate() + 1);
  const y = dt.getUTCFullYear();
  const m = String(dt.getUTCMonth() + 1).padStart(2, "0");
  const d = String(dt.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
