import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import {
  listPreviewableStaff,
  startPreview,
  exitPreview,
  type PreviewStaff,
} from "./preview.server";

/** List active staff users available to preview (super-admin only). */
export const listPreviewableStaffFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => listPreviewableStaff(context.supabase, context.userId));

/** Start a preview session for a role or specific user. */
export const startPreviewFn = createServerFn({ method: "POST" })
  .validator((d) =>
    z
      .object({
        role: z.enum(["manager", "admin", "super_admin"]).optional(),
        user_id: z.string().optional(),
      })
      .parse(d),
  )
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) => {
    const input: { role?: string; userId?: string } = {};
    if (data.role) input.role = data.role;
    if (data.user_id) input.userId = data.user_id;
    return startPreview(context.supabase, context.userId, input);
  });

/** Exit the current preview session. */
export const exitPreviewFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => exitPreview(context.userId));

export type { PreviewStaff };
