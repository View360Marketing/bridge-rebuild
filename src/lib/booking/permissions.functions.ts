import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import {
  resolveEffectivePermissions,
  getManagerPermissions,
  saveManagerPermissions,
  type ResolvedPermissions,
  type ModuleKey,
  type AccessLevel,
} from "./permissions.server";

/** Effective permissions for the current actor (honors active preview). */
export const getEffectivePermissionsFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => resolveEffectivePermissions(context.supabase, context.userId));

const accessSchema = z.object({
  overview: z.enum(["none", "view", "manage"]),
  calendar: z.enum(["none", "view", "manage"]),
  reservations: z.enum(["none", "view", "manage"]),
  guests: z.enum(["none", "view", "manage"]),
  rooms: z.enum(["none", "view", "manage"]),
  social: z.enum(["none", "view", "manage"]),
  reports: z.enum(["none", "view", "manage"]),
});

export const getManagerPermissionsFn = createServerFn({ method: "GET" })
  .validator((d) => z.object({ target_user_id: z.string() }).parse(d))
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) =>
    getManagerPermissions(context.supabase, context.userId, data.target_user_id),
  );

export const saveManagerPermissionsFn = createServerFn({ method: "POST" })
  .validator((d) =>
    z
      .object({
        target_user_id: z.string(),
        permissions: accessSchema,
      })
      .parse(d),
  )
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) => {
    await saveManagerPermissions(
      context.supabase,
      context.userId,
      data.target_user_id,
      data.permissions as ResolvedPermissions,
    );
    return { ok: true };
  });

export type { ResolvedPermissions, ModuleKey, AccessLevel };
