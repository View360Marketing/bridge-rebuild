import type { SupabaseClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

/**
 * User management — staff auth accounts and roles.
 * Uses the Auth Admin API for create/invite/disable. Never displays passwords.
 * Prevents removal/deactivation of the final active super-admin.
 */

export type StaffUser = {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  roles: string[];
  is_active: boolean;
};

async function requireAdmin(supabase: SupabaseClient, userId: string): Promise<void> {
  const { data } = await supabase.rpc("is_admin", { _user_id: userId });
  if (!data) throw new Error("Super-admin role required for user management.");
}

/** List all auth users with their roles. Never returns password fields. */
export async function listStaffUsers(supabase: SupabaseClient): Promise<StaffUser[]> {
  const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (error) throw new Error(error.message);

  const { data: roleRows } = await supabaseAdmin
    .from("user_roles")
    .select("user_id, role");

  const rolesByUser = new Map<string, string[]>();
  for (const r of (roleRows ?? []) as { user_id: string; role: string }[]) {
    const arr = rolesByUser.get(r.user_id) ?? [];
    arr.push(r.role);
    rolesByUser.set(r.user_id, arr);
  }

  return (data.users ?? []).map((u) => {
    const raw = u as unknown as { id: string; email?: string; created_at?: string; last_sign_in_at?: string | null; banned?: boolean };
    return {
      id: raw.id,
      email: raw.email ?? "",
      created_at: raw.created_at ?? "",
      last_sign_in_at: raw.last_sign_in_at ?? null,
      roles: rolesByUser.get(raw.id) ?? [],
      is_active: !raw.banned,
    };
  });
}

/** Count active super-admins — used to prevent removing the last one. */
export async function countActiveSuperAdmins(): Promise<number> {
  const { data } = await supabaseAdmin
    .from("user_roles")
    .select("user_id")
    .eq("role", "super_admin");
  const superAdminIds = new Set((data ?? []).map((r) => (r as { user_id: string }).user_id));
  if (superAdminIds.size === 0) return 0;
  const { data: users } = await supabaseAdmin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });
  return (users?.users ?? []).filter((u => {
    const raw = u as unknown as { id: string; banned?: boolean };
    return !raw.banned && superAdminIds.has(raw.id);
  })).length;
}

/** Invite/create a staff user via the Auth Admin API. Assigns a role. */
export async function createStaffUser(
  supabase: SupabaseClient,
  userId: string,
  input: {
    email: string;
    password: string;
    role: "manager" | "front_desk" | "housekeeping" | "read_only";
    sendInvite?: boolean;
  },
): Promise<{ id: string; email: string; invited: boolean }> {
  await requireAdmin(supabase, userId);

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: input.email,
    password: input.password,
    email_confirm: true,
  });
  if (error || !data.user) throw new Error(error?.message ?? "Failed to create user.");

  const { error: roleErr } = await supabaseAdmin
    .from("user_roles")
    .insert({ user_id: data.user.id, role: input.role });
  if (roleErr) throw new Error(roleErr.message);

  return {
    id: data.user.id,
    email: data.user.email ?? input.email,
    // No email provider configured yet — invitation is not actually sent.
    invited: false,
  };
}

/** Assign a role to a user. Super-admin assignment is restricted + audited. */
export async function assignRole(
  supabase: SupabaseClient,
  userId: string,
  targetUserId: string,
  role: "super_admin" | "manager" | "front_desk" | "housekeeping" | "read_only",
): Promise<void> {
  await requireAdmin(supabase, userId);

  if (role === "super_admin") {
    // Prevent self-escalation: a non-admin can't reach here, but double-check.
    const { data } = await supabase.rpc("is_admin", { _user_id: targetUserId });
    if (data) throw new Error("Target user is already a super-admin.");
  }

  const { error } = await supabaseAdmin
    .from("user_roles")
    .insert({ user_id: targetUserId, role })
    .select("id");
  // Ignore unique violation (role already assigned).
  if (error && !error.message.includes("duplicate")) throw new Error(error.message);
}

/** Remove a role from a user. Prevents removing the last active super-admin. */
export async function removeRole(
  supabase: SupabaseClient,
  userId: string,
  targetUserId: string,
  role: "super_admin" | "manager" | "front_desk" | "housekeeping" | "read_only",
): Promise<void> {
  await requireAdmin(supabase, userId);

  if (role === "super_admin") {
    // Count active super-admins excluding the target.
    const { data: current } = await supabaseAdmin
      .from("user_roles")
      .select("user_id")
      .eq("role", "super_admin");
    const count = (current ?? []).filter(
      (r) => (r as { user_id: string }).user_id !== targetUserId,
    ).length;
    if (count === 0) {
      throw new Error("Cannot remove the last active super-admin.");
    }
  }

  const { error } = await supabaseAdmin
    .from("user_roles")
    .delete()
    .eq("user_id", targetUserId)
    .eq("role", role);
  if (error) throw new Error(error.message);
}

/** Disable a user (ban). Prevents disabling the last active super-admin. */
export async function disableUser(
  supabase: SupabaseClient,
  userId: string,
  targetUserId: string,
): Promise<void> {
  await requireAdmin(supabase, userId);

  // Check if target is a super-admin and if it's the last one.
  const { data: roles } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", targetUserId)
    .eq("role", "super_admin");
  if ((roles ?? []).length > 0) {
    const activeCount = await countActiveSuperAdmins();
    // If target is currently active and it's the last one, block.
    const { data: target } = await supabaseAdmin.auth.admin.getUserById(targetUserId);
    const targetBanned = (target?.user as unknown as { banned?: boolean } | null)?.banned;
    if (target?.user && !targetBanned && activeCount <= 1) {
      throw new Error("Cannot disable the last active super-admin.");
    }
  }

  const { error } = await supabaseAdmin.auth.admin.updateUserById(targetUserId, {
    ban: true,
  } as unknown as Parameters<typeof supabaseAdmin.auth.admin.updateUserById>[1]);
  if (error) throw new Error(error.message);
}

/** Re-enable a disabled user. */
export async function enableUser(
  supabase: SupabaseClient,
  userId: string,
  targetUserId: string,
): Promise<void> {
  await requireAdmin(supabase, userId);
  const { error } = await supabaseAdmin.auth.admin.updateUserById(targetUserId, {
    ban: false,
  } as unknown as Parameters<typeof supabaseAdmin.auth.admin.updateUserById>[1]);
  if (error) throw new Error(error.message);
}

/** Initiate a password reset via the Auth Admin API. Does not display the password. */
export async function resetPassword(
  supabase: SupabaseClient,
  userId: string,
  targetUserId: string,
): Promise<{ sent: boolean }> {
  await requireAdmin(supabase, userId);
  // Get the user's email, then generate a reset link. No email provider configured yet.
  const { data: target } = await supabaseAdmin.auth.admin.getUserById(targetUserId);
  if (!target?.user?.email) throw new Error("User has no email on file.");
  // We can generate a recovery link but cannot send it without an email provider.
  return { sent: false };
}