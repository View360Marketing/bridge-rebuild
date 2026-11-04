import { createFileRoute } from "@tanstack/react-router";

/**
 * TEMPORARY one-time photo import trigger — localhost only.
 * Runs the full Hostaway photo import inside the server runtime where the
 * Cloud service-role key is available. Removed after the import completes.
 */
export const Route = createFileRoute("/api/run-photo-import-now")({
  server: {
    handlers: {
      GET: async ({ request }) => {
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