/**
 * Safe iCal feed fetcher with SSRF protection, timeouts, and size limits.
 */
const MAX_FEED_BYTES = 2_000_000;
const FETCH_TIMEOUT_MS = 15_000;

function isAllowedHost(url: string): boolean {
  try {
    const u = new URL(url);
    if (u.protocol !== "https:") return false;
    const host = u.hostname.toLowerCase();
    if (host === "localhost" || host.endsWith(".localhost")) return false;
    if (host === "0.0.0.0" || host === "metadata.google.internal") return false;
    if (/^127\./.test(host) || /^10\./.test(host) || /^192\.168\./.test(host)) return false;
    if (/^169\.254\./.test(host)) return false;
    if (/^172\.(1[6-9]|2\d|3[01])\./.test(host)) return false;
    if (host === "::1" || host.startsWith("fc") || host.startsWith("fd")) return false;
    return true;
  } catch {
    return false;
  }
}

export async function fetchIcalFeed(url: string): Promise<string> {
  if (!isAllowedHost(url)) {
    throw new Error("Blocked: feed URL must be HTTPS and not point to a private/internal host.");
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: "text/calendar, application/calendar+json, */*" },
      redirect: "follow",
    });
    if (!res.ok) {
      throw new Error(`Feed fetch failed: HTTP ${res.status}`);
    }
    const text = await res.text();
    if (text.length > MAX_FEED_BYTES) {
      throw new Error(`Feed exceeds maximum size of ${MAX_FEED_BYTES} bytes`);
    }
    if (text.length > 0 && !text.includes("BEGIN:VCALENDAR")) {
      throw new Error("Feed response is not valid iCalendar data (missing VCALENDAR).");
    }
    return text;
  } finally {
    clearTimeout(timeout);
  }
}
