/**
 * Date helpers for the booking engine.
 *
 * Property timezone is America/Chicago. Overnight stays are stored as date-only
 * property-local dates. A stay [checkin, checkout) occupies every night from
 * checkin up to (but not including) checkout. Nights are counted by calendar
 * dates, never by elapsed-milliseconds / 24h, so DST transitions and leap days
 * are handled correctly.
 */

export const PROPERTY_TIMEZONE = "America/Chicago";

export type ISODate = string; // YYYY-MM-DD

/** Parse a YYYY-MM-DD string into a UTC midnight Date (no timezone shift). */
export function parseDate(s: string): Date {
  const parts = s.split("-").map(Number);
  const y = parts[0] ?? 1970;
  const m = parts[1] ?? 1;
  const d = parts[2] ?? 1;
  return new Date(Date.UTC(y, m - 1, d));
}

/** Format a Date as YYYY-MM-DD using UTC getters. */
export function formatDate(d: Date): ISODate {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Today as YYYY-MM-DD in the property timezone (America/Chicago). */
export function todayPropertyLocal(): ISODate {
  // Use Intl to get the current calendar date in America/Chicago.
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: PROPERTY_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "00";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

/** Add n days to a YYYY-MM-DD date, returning YYYY-MM-DD. */
export function addDays(s: ISODate, n: number): ISODate {
  const d = parseDate(s);
  d.setUTCDate(d.getUTCDate() + n);
  return formatDate(d);
}

/** Inclusive list of occupied nights for [checkin, checkout). */
export function nightsBetween(checkin: ISODate, checkout: ISODate): ISODate[] {
  const out: ISODate[] = [];
  let cur = checkin;
  while (cur < checkout) {
    out.push(cur);
    cur = addDays(cur, 1);
  }
  return out;
}

/** Number of nights for [checkin, checkout). */
export function nightCount(checkin: ISODate, checkout: ISODate): number {
  return Math.round((parseDate(checkout).getTime() - parseDate(checkin).getTime()) / 86_400_000);
}

/** Validate a stay range. Returns null if valid, an error message otherwise. */
export function validateRange(checkin: ISODate, checkout: ISODate): string | null {
  if (!checkin || !checkout) return "Check-in and check-out dates are required.";
  if (checkout <= checkin) return "Check-out must be after check-in.";
  return null;
}

/** Day-of-week: 0=Sun ... 6=Sat (UTC, which matches property-local for date-only math). */
export function dayOfWeek(s: ISODate): number {
  return parseDate(s).getUTCDay();
}

export function isWeekend(s: ISODate, weekendDays: number[] = [5, 6]): boolean {
  return weekendDays.includes(dayOfWeek(s));
}

/** Generate a booking reference like BR-7QK3M2. */
export function generateBookingReference(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "BR-";
  for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}
