/**
 * Calendar export utilities for property events.
 * Generates Google Calendar URLs and downloadable .ics files.
 * All times are interpreted in America/Chicago (CST/CDT) and
 * converted to UTC for calendar formats.
 */

export type CalendarEventInput = {
  code: string;
  title: string;
  description: string | null;
  eventDate: string; // "2026-12-05"
  endDate: string | null; // "2026-12-06" (exclusive for all-day)
  startTime: string | null; // "09:00"
  endTime: string | null; // "11:00"
  location: string | null;
};

/** Returns the IANA offset string for America/Chicago on the given date. */
function chicagoOffset(dateStr: string): string {
  const parts = dateStr.split("-").map(Number);
  const y = parts[0] ?? 0;
  const m = parts[1] ?? 0;
  const d = parts[2] ?? 0;
  if (m < 3 || m > 11) return "-06:00"; // CST
  if (m > 3 && m < 11) return "-05:00"; // CDT
  if (m === 3) {
    const secondSunday = nthSunday(y, 3, 2);
    return d >= secondSunday ? "-05:00" : "-06:00";
  }
  // November — DST ends first Sunday
  const firstSunday = nthSunday(y, 11, 1);
  return d >= firstSunday ? "-06:00" : "-05:00";
}

/** Returns the day-of-month of the nth Sunday in month (1-based). */
function nthSunday(year: number, month: number, nth: number): number {
  const first = new Date(year, month - 1, 1);
  const dow = first.getDay();
  return 1 + ((0 - dow + 7) % 7) + (nth - 1) * 7;
}

/** Converts a date + time in America/Chicago to compact UTC (20261205T150000Z). */
function toUtcCompact(dateStr: string, timeStr: string): string {
  const offset = chicagoOffset(dateStr);
  const dt = new Date(`${dateStr}T${timeStr}:00${offset}`);
  return dt
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}Z$/, "Z");
}

/** Returns a compact UTC timestamp for DTSTAMP. */
function icsTimestamp(): string {
  return new Date()
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}Z$/, "Z");
}

/** Adds one day to a "YYYY-MM-DD" string (for exclusive end dates). */
function addDay(dateStr: string): string {
  const parts = dateStr.split("-").map(Number);
  const y = parts[0] ?? 0;
  const m = parts[1] ?? 0;
  const d = parts[2] ?? 0;
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + 1);
  return dt.toISOString().slice(0, 10);
}

/** Escapes special characters for iCalendar TEXT values. */
function esc(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

export function generateGoogleCalendarUrl(ev: CalendarEventInput): string {
  const params = new URLSearchParams();
  params.set("action", "TEMPLATE");
  params.set("text", ev.title);
  if (ev.startTime) {
    const start = toUtcCompact(ev.eventDate, ev.startTime);
    const end = toUtcCompact(ev.endDate ?? ev.eventDate, ev.endTime ?? ev.startTime);
    params.set("dates", `${start}/${end}`);
  } else {
    const start = ev.eventDate.replace(/-/g, "");
    const end = addDay(ev.endDate ?? ev.eventDate).replace(/-/g, "");
    params.set("dates", `${start}/${end}`);
  }
  if (ev.description) params.set("details", ev.description);
  if (ev.location) params.set("location", ev.location);
  return `https://www.google.com/calendar/render?${params.toString()}`;
}

export function generateIcsContent(ev: CalendarEventInput): string {
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//The Bridges TN//Events//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${ev.code}@thebridgestn.com`,
    `DTSTAMP:${icsTimestamp()}`,
  ];
  if (ev.startTime) {
    const start = toUtcCompact(ev.eventDate, ev.startTime);
    const end = toUtcCompact(ev.endDate ?? ev.eventDate, ev.endTime ?? ev.startTime);
    lines.push(`DTSTART:${start}`, `DTEND:${end}`);
  } else {
    lines.push(`DTSTART;VALUE=DATE:${ev.eventDate.replace(/-/g, "")}`);
    lines.push(`DTEND;VALUE=DATE:${addDay(ev.endDate ?? ev.eventDate).replace(/-/g, "")}`);
  }
  lines.push(`SUMMARY:${esc(ev.title)}`);
  if (ev.description) lines.push(`DESCRIPTION:${esc(ev.description)}`);
  if (ev.location) lines.push(`LOCATION:${esc(ev.location)}`);
  lines.push("END:VEVENT", "END:VCALENDAR");
  return lines.join("\r\n");
}

/** Triggers a browser download of a .ics file for the given event. */
export function downloadIcs(ev: CalendarEventInput): void {
  const content = generateIcsContent(ev);
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${ev.code || "event"}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
