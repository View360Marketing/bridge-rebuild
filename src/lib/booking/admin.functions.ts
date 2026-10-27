import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * One-shot bootstrap of the initial super-admin. Unauthenticated but guarded: it refuses once
 * integration_settings.bootstrap_completed_at is set, and it only ever creates/promotes the
 * account named by the server-side BOOTSTRAP_* secrets (never resets an existing password).
 */
export const bootstrapAdmin = createServerFn({ method: "POST" }).handler(async () => {
  const { runBootstrap } = await import("./admin.server");
  return runBootstrap();
});

export const getCurrentStaff = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { getCurrentStaff: getStaff } = await import("./admin.server");
    return getStaff(context.supabase, context.userId);
  });

export const getDashboardStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const [props, types, units, settings] = await Promise.all([
      context.supabase.from("properties").select("id", { count: "exact", head: true }),
      context.supabase.from("room_types").select("id", { count: "exact", head: true }),
      context.supabase
        .from("units")
        .select("id,is_published,is_archived,is_closed", { count: "exact" }),
      context.supabase.from("integration_settings").select("*").eq("id", 1).single(),
    ]);

    const unitRows = units.data ?? [];
    return {
      properties: props.count ?? 0,
      roomTypes: types.count ?? 0,
      unitsTotal: units.count ?? 0,
      unitsPublished: unitRows.filter((u) => u.is_published && !u.is_archived).length,
      unitsConfigured: unitRows.filter((u) => !u.is_archived).length,
      unitsClosed: unitRows.filter((u) => u.is_closed && !u.is_archived).length,
      expectedRoomCount: settings.data?.expected_room_count ?? 33,
      inventoryAuthority: settings.data?.inventory_authority ?? "UNRESOLVED",
      instantBookingEnabled: settings.data?.instant_booking_enabled ?? false,
      bootstrapCompletedAt: settings.data?.bootstrap_completed_at ?? null,
    };
  });
