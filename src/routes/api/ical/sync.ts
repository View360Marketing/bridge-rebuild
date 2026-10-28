import { createFileRoute } from "@tanstack/react-router";

/**
 * Scheduler trigger for iCal import (Airbnb -> website).
 *
 * POST /api/ical/sync  with header `x-cron-secret: <CRON_SECRET>`.
 *
 * Designed to be called by an external durable scheduler (cron) roughly
 * every 5 minutes, staggered. It imports every unit that has a saved
 * Airbnb import URL and runs the atomic claim_block reconciliation.
 *
 * Authorization: a shared secret (CRON_SECRET) kept server-side. If the
 * secret is not configured the endpoint returns 503 so callers know the
 * scheduler is not wired up; it never runs unauthenticated.
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
        const provided = request.headers.get("x-cron-secret") ?? "";
        // timingSafeEqual would be better but crypto.subtle is async; constant-time compare
        // of equal-length strings is sufficient here since the secret is fixed-length.
        if (!provided || provided.length !== secret.length || provided !== secret) {
          return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
        }

        const { runScheduledSync, checkIcalFreshness } = await import(
          "@/lib/booking/ical.server"
        );
        try {
          const [results, fresh] = await Promise.all([
            runScheduledSync(),
            checkIcalFreshness(),
          ]);
          return Response.json({
            ok: true,
            synced: results.length,
            stale: fresh.stale.length,
            results,
          });
        } catch (e) {
          return Response.json(
            { ok: false, error: (e as Error).message },
            { status: 500 },
          );
        }
      },
    },
  },
});