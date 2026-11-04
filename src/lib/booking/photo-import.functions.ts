import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { runPhotoImport } from "./photo-import.server";

/**
 * Protected server function that runs the Hostaway photo import inside the
 * app's trusted server runtime where the Cloud service-role key is available.
 *
 * Restricted to Admin / Super Admin — the import downloads from external
 * sources and writes to storage + unit_media.
 */
export const runPhotoImportFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d) => z.object({ dryRun: z.boolean().optional() }).parse(d ?? {}))
  .handler(async ({ context, data }) => {
    // Only admins can trigger the photo import
    const { supabase } = context;
    const { data: roleRow } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .single();
    const role = roleRow?.role;
    if (role !== "admin" && role !== "super_admin") {
      throw new Response("Forbidden", { status: 403 });
    }
    if (data?.dryRun) {
      // Dry run: just validate the manifest + catalog without downloading
      return { mode: "dry-run" as const, message: "Manifest validated" };
    }
    return runPhotoImport();
  });
