import type { SupabaseClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

/**
 * Centralized role + per-manager module permission evaluation.
 *
 * Effective permission = role-based defaults overridden by any saved
 * manager_permissions rows for the *acting* user. When previewing
 * another user, the preview target's roles + permissions are evaluated
 * instead, but writes are always blocked (preview = read-only).
 */

export type ModuleKey =
  | "overview"
  | "calendar"
  | "reservations"
  | "guests"
  | "rooms"
  | "social"
  | "reports"
  | "events"
  | "massage";

export type AccessLevel = "none" | "view" | "manage";

export type ResolvedPermissions = Record<ModuleKey, AccessLevel>;

export const ALL_MODULES: ModuleKey[] = [
  "overview",
  "calendar",
  "reservations",
  "guests",
  "rooms",
  "social",
  "reports",
  "events",
  "massage",
];

const MODULE_LABELS: Record<ModuleKey, string> = {
  overview: "Overview",
  calendar: "Calendar",
  reservations: "Reservations",
  guests: "Guests",
  rooms: "Rooms & Properties",
  social: "Social Media",
  reports: "Reports",
  events: "Events",
  massage: "Massage Bookings",
};

export function moduleLabel(m: ModuleKey): string {
  return MODULE_LABELS[m];
}

/** Role -> default module access. Admins/super_admin get full access to ops modules. */
export function defaultAccessForRole(role: string): ResolvedPermissions {
  if (role === "super_admin" || role === "admin") {
    return {
      overview: "manage",
      calendar: "manage",
      reservations: "manage",
      guests: "manage",
      rooms: "manage",
      social: "manage",
      reports: "manage",
      events: "manage",
      massage: "manage",
    };
  }
  // Manager defaults (spec: Calendar + Events + Massage manage; others none)
  return {
    overview: "none",
    calendar: "manage",
    reservations: "none",
    guests: "none",
    rooms: "none",
    social: "manage",
    reports: "none",
    events: "manage",
    massage: "manage",
  };
}

/** Modules only super_admin/admin may ever see in nav (restricted modules). */
export const RESTRICTED_MODULES: ModuleKey[] = [];

/**
 * Resolve effective permissions for a real, signed-in user.
 * Combines role defaults with any saved manager_permissions overrides.
 */
export async function resolvePermissions(
  supabase: SupabaseClient,
  userId: string,
): Promise<{ role: string; permissions: ResolvedPermissions; email?: string }> {
  const { data: roleRows } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  const roles = (roleRows ?? []).map((r) => (r as { role: string }).role);

  let role = "guest";
  if (roles.includes("super_admin")) role = "super_admin";
  else if (roles.includes("admin")) role = "admin";
  else if (roles.includes("manager")) role = "manager";
  else if (roles.includes("front_desk")) role = "front_desk";
  else if (roles.includes("housekeeping")) role = "housekeeping";
  else if (roles.includes("read_only")) role = "read_only";

  let permissions = defaultAccessForRole(role);

  if (role === "manager") {
    const { data: overrides } = await supabase
      .from("manager_permissions")
      .select("module, access")
      .eq("user_id", userId);
    for (const row of (overrides ?? []) as { module: ModuleKey; access: AccessLevel }[]) {
      if (ALL_MODULES.includes(row.module)) {
        permissions = { ...permissions, [row.module]: row.access };
      }
    }
  }

  const result: { role: string; permissions: ResolvedPermissions; email?: string } = {
    role,
    permissions,
  };
  return result;
}

/** Load saved per-manager permissions (super_admin only) for the access editor. */
export async function getManagerPermissions(
  _supabase: SupabaseClient,
  actorId: string,
  targetUserId: string,
): Promise<ResolvedPermissions> {
  const { data: isSuper } = await supabaseAdmin.rpc("is_super_admin", {
    _user_id: actorId,
  });
  if (!isSuper) throw new Error("Only the super admin may view permission settings.");
  const { data } = await supabaseAdmin
    .from("manager_permissions")
    .select("module, access")
    .eq("user_id", targetUserId);
  const base = defaultAccessForRole("manager");
  for (const row of (data ?? []) as { module: ModuleKey; access: AccessLevel }[]) {
    if (ALL_MODULES.includes(row.module)) base[row.module] = row.access;
  }
  return base;
}

/** Save per-manager permissions (super_admin only). */
export async function saveManagerPermissions(
  _supabase: SupabaseClient,
  actorId: string,
  targetUserId: string,
  permissions: ResolvedPermissions,
): Promise<void> {
  const { data: isSuper } = await supabaseAdmin.rpc("is_super_admin", {
    _user_id: actorId,
  });
  if (!isSuper) throw new Error("Only the super admin may change permission settings.");

  // Upsert each module's access.
  const rows = ALL_MODULES.map((module) => ({
    user_id: targetUserId,
    module,
    access: permissions[module],
    updated_by: actorId,
    updated_at: new Date().toISOString(),
  }));

  const { error } = await supabaseAdmin
    .from("manager_permissions")
    .upsert(rows, { onConflict: "user_id,module" });
  if (error) throw new Error(error.message);

  await supabaseAdmin.from("audit_events").insert({
    actor_id: actorId,
    action: "permissions.update",
    entity_type: "manager_permissions",
    entity_id: targetUserId,
    metadata: { permissions },
  });
}

/** Resolve the effective (possibly preview) permissions for the current actor. */
export async function resolveEffectivePermissions(
  supabase: SupabaseClient,
  actorId: string,
): Promise<{
  role: string;
  permissions: ResolvedPermissions;
  isPreview: boolean;
  previewTarget?: { role: string; userId?: string; name?: string };
}> {
  // Check for an active preview session owned by the actor.
  const { data: previewRows } = await supabaseAdmin
    .from("preview_sessions")
    .select("target_role,target_user_id,expires_at")
    .eq("actor_id", actorId)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(1);
  const active =
    (previewRows?.[0] as
      | { target_role: string | null; target_user_id: string | null; expires_at: string }
      | undefined) ?? null;

  if (active) {
    let role = active.target_role ?? "manager";
    let perms: ResolvedPermissions;
    let name: string | undefined;

    if (active.target_user_id) {
      const resolved = await resolvePermissions(supabase, active.target_user_id);
      role = resolved.role;
      perms = resolved.permissions;
      // Fetch the target user's email for the banner label.
      const { data: u } = await supabaseAdmin.auth.admin.getUserById(active.target_user_id);
      name = (u?.user as { email?: string } | null)?.email;
    } else {
      perms = defaultAccessForRole(role);
    }

    // Preview is always read-only: cap at "view".
    const capped: ResolvedPermissions = { ...perms };
    (Object.keys(capped) as ModuleKey[]).forEach((m) => {
      if (perms[m] === "manage") capped[m] = "view";
    });

    const previewTarget: { role: string; userId?: string; name?: string } = { role };
    if (active.target_user_id) previewTarget.userId = active.target_user_id;
    if (name) previewTarget.name = name;

    const previewResult: {
      role: string;
      permissions: ResolvedPermissions;
      isPreview: boolean;
      previewTarget?: { role: string; userId?: string; name?: string };
    } = {
      role,
      permissions: capped,
      isPreview: true,
    };
    previewResult.previewTarget = previewTarget;
    return previewResult;
  }

  const real = await resolvePermissions(supabase, actorId);
  return {
    role: real.role,
    permissions: real.permissions,
    isPreview: false,
  };
}
