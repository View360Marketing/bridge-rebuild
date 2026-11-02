import type { SupabaseClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { resolvePermissions, defaultAccessForRole } from "./permissions.server";

export type PreviewStaff = {
  id: string;
  email: string;
  roles: string[];
};

/** List active staff users that can be previewed (managers + admins). Super-admin only. */
export async function listPreviewableStaff(
  _supabase: SupabaseClient,
  actorId: string,
): Promise<PreviewStaff[]> {
  const { data: isSuper } = await supabaseAdmin.rpc("is_super_admin", { _user_id: actorId });
  if (!isSuper) throw new Error("Only the super admin may list previewable staff.");

  const { data: users, error } = await supabaseAdmin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });
  if (error) throw new Error(error.message);

  const { data: roleRows } = await supabaseAdmin.from("user_roles").select("user_id, role");
  const rolesByUser = new Map<string, string[]>();
  for (const r of (roleRows ?? []) as { user_id: string; role: string }[]) {
    const arr = rolesByUser.get(r.user_id) ?? [];
    arr.push(r.role);
    rolesByUser.set(r.user_id, arr);
  }

  return (users?.users ?? [])
    .filter((u) => {
      const raw = u as unknown as { banned?: boolean };
      return !raw.banned;
    })
    .map((u) => {
      const raw = u as unknown as { id: string; email?: string };
      const roles = rolesByUser.get(raw.id) ?? [];
      return { id: raw.id, email: raw.email ?? "", roles };
    })
    .filter((u) => u.roles.some((r) => ["manager", "admin"].includes(r)));
}

/** Start a preview session. Only super_admin/admin may preview. */
export async function startPreview(
  supabase: SupabaseClient,
  actorId: string,
  target: { role?: string; userId?: string },
): Promise<{ ok: boolean; message: string }> {
  const { data: isAdmin } = await supabaseAdmin.rpc("is_admin", { _user_id: actorId });
  if (!isAdmin) throw new Error("Only administrators may use preview mode.");

  // Admins (non-super) can only preview the manager role.
  const { data: isSuper } = await supabaseAdmin.rpc("is_super_admin", { _user_id: actorId });
  if (!isSuper && target.role !== "manager") {
    throw new Error("Admins may only preview the Manager role.");
  }

  // Delete any existing preview session for this actor.
  await supabaseAdmin.from("preview_sessions").delete().eq("actor_id", actorId);

  let targetRole = target.role ?? "manager";
  let targetUserId = target.userId ?? null;
  if (targetUserId) {
    const resolved = await resolvePermissions(supabase, targetUserId);
    targetRole = resolved.role;
  }

  const expiresAt = new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(); // 4h
  const { error } = await supabaseAdmin.from("preview_sessions").insert({
    actor_id: actorId,
    target_role: targetRole,
    target_user_id: targetUserId,
    expires_at: expiresAt,
  });
  if (error) throw new Error(error.message);

  return { ok: true, message: "Preview started." };
}

/** Exit the current preview session. */
export async function exitPreview(actorId: string): Promise<{ ok: boolean }> {
  await supabaseAdmin.from("preview_sessions").delete().eq("actor_id", actorId);
  return { ok: true };
}

export { defaultAccessForRole };
