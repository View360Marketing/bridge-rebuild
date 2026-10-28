import { createFileRoute } from "@tanstack/react-router";
import { timingSafeEqual } from "crypto";

/**
 * Scheduler trigger for iCal import (Airbnb -> website).
 *
 * POST /api/ical/sync  with header `x-cron-secret: <ICAL_CRON_SECRET>`.
 *
 * Designed to be called by an external durable scheduler (cron) roughly
 * every 5 minutes, staggered. It imports every unit that has a saved
 * Airbnb import URL and runs the atomic reconciliation.
 *
 * Authorization: a shared secret (ICAL_CRON_SECRET) kept server-side. If the
 * secret is not configured the endpoint returns 503 so callers know the
 * scheduler is not wired up; it never runs unauthenticated.
 *
 * NOTE: This endpoint exists and is reachable, but it does NOT schedule
 * itself. A recurring cron job must be configured externally to call this
 * endpoint. Saving ICAL_CRON_SECRET enables authorization; it does not by
 * itself activate scheduling.
 */
export const Route = createFileRoute("/api/ical/sync")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env["ICAL_CRON_SECRET"];
        if (!secret) {
          return Response.json(
            { ok: false, error: "Scheduler not configured: ICAL_CRON_SECRET is not set" },
            { status: 503 },
          );
        }
        const provided = Buffer.from(request.headers.get("x-cron-secret") ?? "");
        const expected = Buffer.from(secret);
        // Constant-time comparison; mismatched lengths are rejected.
        if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) {
          return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
        }

        const { runScheduledSync, checkIcalFreshness } = await import("@/lib/booking/ical.server");
        try {
          const [results, fresh] = await Promise.all([runScheduledSync(), checkIcalFreshness()]);
          return Response.json({
            ok: true,
            synced: results.length,
            stale: fresh.stale.length,
            results,
          });
        } catch (e) {
          return Response.json({ ok: false, error: (e as Error).message }, { status: 500 });
        }
      },
    },
  },
});
