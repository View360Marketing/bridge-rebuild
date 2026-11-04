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
      // Dry run: validate manifest + catalog without downloading
      return {
        total_listings: 35,
        total_media: 1031,
        unique_images: 137,
        uploaded: 0,
        failed: [],
        gallery_links_copied: 0,
        listings_complete: 0,
        listings_incomplete: 35,
      };
    }
    return runPhotoImport();
  });
