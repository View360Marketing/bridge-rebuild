import { createFileRoute } from "@tanstack/react-router";
import { timingSafeEqual } from "crypto";

/**
 * One-time photo import trigger.
 *
 * POST /api/import-hostaway-photos with header `x-cron-secret: <ICAL_CRON_SECRET>`.
 * Optional query param `?limit=N` processes at most N new unique images per call
 * (bounded batches for platform execution limits). Omit for all remaining.
 *
 * Downloads verified Hostaway images into the project's owned unit-media storage
 * and populates unit_media + primary_image_url.
 *
 * Authorization: same shared secret as the iCal sync endpoint. If the
 * secret is not configured, returns 503 (never runs unauthenticated).
 */
export const Route = createFileRoute("/api/import-hostaway-photos")({
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
        if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) {
          return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
        }

        const url = new URL(request.url);
        const limitParam = url.searchParams.get("limit");
        const limit = limitParam ? parseInt(limitParam, 10) : undefined;

        const { runPhotoImport } = await import("@/lib/booking/photo-import.server");
        try {
          const result = await runPhotoImport(limit);
          return Response.json({ ok: true, ...result });
        } catch (e) {
          return Response.json({ ok: false, error: (e as Error).message }, { status: 500 });
        }
      },
    },
  },
});
