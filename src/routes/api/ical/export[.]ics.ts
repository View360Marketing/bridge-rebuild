import { createFileRoute } from "@tanstack/react-router";

/**
 * Public iCal export endpoint (website -> Airbnb).
 *
 * URL: /api/ical/export.ics?unit=<unitId>&token=<exportToken>
 *
 * - Requires the unit's unpredictable, revocable ical_export_token.
 * - Returns valid iCalendar (text/calendar) with stable UIDs and
 *   inclusive-start/exclusive-end DATE values (America/Chicago nights).
 * - Exports only confirmed direct reservations + maintenance/owner blocks.
 *   Airbnb-imported blocks are excluded so a round trip cannot echo back.
 * - Emits availability information only — no guest names, contact, payment,
 *   or access data.
 */
export const Route = createFileRoute("/api/ical/export.ics")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const unitId = url.searchParams.get("unit") ?? "";
        const token = url.searchParams.get("token") ?? "";
        if (!unitId || !token) {
          return new Response("Bad request", { status: 400 });
        }

        const { buildUnitIcsExport } = await import("@/lib/booking/ical.server");

        let ics: string | null;
        try {
          ics = await buildUnitIcsExport(unitId, token);
        } catch {
          return new Response("Server error", { status: 500 });
        }
        if (!ics) return new Response("Not found", { status: 404 });

        return new Response(ics, {
          status: 200,
          headers: {
            "Content-Type": "text/calendar; charset=utf-8",
            // Short cache so reservation changes surface on Airbnb's next
            // import cycle without hiding stale availability behind a CDN.
            "Cache-Control": "public, max-age=300",
          },
        });
      },
    },
  },
});
