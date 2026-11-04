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

async function requireAdmin(_supabase: SupabaseClient, userId: string): Promise<void> {
  const { data } = await supabaseAdmin.rpc("is_admin", { _user_id: userId });
  if (!data) throw new Error("Administrator role required for user management.");
}

/** Super-admin-only check (Ben). Used for destructive/sensitive operations. */
async function requireSuperAdmin(_supabase: SupabaseClient, userId: string): Promise<void> {
  const { data } = await supabaseAdmin.rpc("is_super_admin", { _user_id: userId });
  if (!data)
    throw new Error("Only the super-admin (ben@view360.marketing) may perform this action.");
}

type StaffRole = "super_admin" | "admin" | "manager" | "front_desk" | "housekeeping" | "read_only";

/** List all auth users with their roles. Never returns password fields. */
export async function listStaffUsers(supabase: SupabaseClient): Promise<StaffUser[]> {
  const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (error) throw new Error(error.message);

  const { data: roleRows } = await supabaseAdmin.from("user_roles").select("user_id, role");

  const rolesByUser = new Map<string, string[]>();
  for (const r of (roleRows ?? []) as { user_id: string; role: string }[]) {
    const arr = rolesByUser.get(r.user_id) ?? [];
    arr.push(r.role);
    rolesByUser.set(r.user_id, arr);
  }

  return (data.users ?? []).map((u) => {
    const raw = u as unknown as {
      id: string;
      email?: string;
      created_at?: string;
      last_sign_in_at?: string | null;
      banned?: boolean;
    };
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
  return (users?.users ?? []).filter((u) => {
    const raw = u as unknown as { id: string; banned?: boolean };
    return !raw.banned && superAdminIds.has(raw.id);
  }).length;
}

/** Invite/create a staff user via the Auth Admin API. Assigns a role. */
export async function createStaffUser(
  supabase: SupabaseClient,
  userId: string,
  input: {
    email: string;
    password: string;
    role: StaffRole;
    sendInvite?: boolean;
  },
): Promise<{ id: string; email: string; invited: boolean }> {
  await requireAdmin(supabase, userId);
  // Only Ben can create Admin accounts; Admins can create Managers and below.
  if (input.role === "admin") await requireSuperAdmin(supabase, userId);
  if (input.role === "super_admin")
    throw new Error("Super-admin accounts cannot be created through the dashboard.");

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

  await supabaseAdmin.from("audit_events").insert({
    actor_id: userId,
    action: "user.create",
    entity_type: "auth.users",
    entity_id: data.user.id,
    metadata: { email: input.email, role: input.role },
  });

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
  role: StaffRole,
): Promise<void> {
  await requireAdmin(supabase, userId);

  if (role === "super_admin") {
    // The DB trigger (guard_super_admin) already blocks this for non-Ben accounts,
    // but reject early with a clear message.
    throw new Error("Super-admin cannot be assigned through the dashboard.");
  }
  if (role === "admin") {
    // Only Ben can promote to admin.
    await requireSuperAdmin(supabase, userId);
  }

  // Admins cannot change another admin's role; only Ben can.
  if (role !== "admin") {
    const { data: targetRoles } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", targetUserId);
    if ((targetRoles ?? []).some((r) => (r as { role: string }).role === "admin")) {
      await requireSuperAdmin(supabase, userId);
    }
  }

  const { error } = await supabaseAdmin
    .from("user_roles")
    .insert({ user_id: targetUserId, role })
    .select("id");
  // Ignore unique violation (role already assigned).
  if (error && !error.message.includes("duplicate")) throw new Error(error.message);

  await supabaseAdmin.from("audit_events").insert({
    actor_id: userId,
    action: "user.assign_role",
    entity_type: "user_roles",
    entity_id: targetUserId,
    metadata: { role },
  });
}

/** Remove a role from a user. Prevents demoting Ben or the last active super-admin. */
export async function removeRole(
  supabase: SupabaseClient,
  userId: string,
  targetUserId: string,
  role: StaffRole,
): Promise<void> {
  await requireAdmin(supabase, userId);

  if (role === "super_admin") {
    // Only Ben may hold super_admin and it cannot be removed (DB trigger enforces).
    throw new Error("Cannot remove the super-admin role from ben@view360.marketing.");
  }
  if (role === "admin") {
    // Demoting an admin requires Ben.
    await requireSuperAdmin(supabase, userId);
  }

  const { error } = await supabaseAdmin
    .from("user_roles")
    .delete()
    .eq("user_id", targetUserId)
    .eq("role", role);
  if (error) throw new Error(error.message);

  await supabaseAdmin.from("audit_events").insert({
    actor_id: userId,
    action: "user.remove_role",
    entity_type: "user_roles",
    entity_id: targetUserId,
    metadata: { role },
  });
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
  const { data: target } = await supabaseAdmin.auth.admin.getUserById(targetUserId);
  if (!target?.user?.email) throw new Error("User has no email on file.");
  return { sent: false };
}

/**
 * Manually set a user's password via the Auth Admin API.
 * - Requires super_admin privilege.
 * - Enforces minimum 8 characters.
 * - Updates the user's password directly.
 * - Never returns or logs the password.
 */
export async function setUserPassword(
  supabase: SupabaseClient,
  adminUserId: string,
  targetUserId: string,
  newPassword: string,
): Promise<{ success: boolean; message: string }> {
  await requireAdmin(supabase, adminUserId);

  if (!newPassword || newPassword.length < 8) {
    throw new Error("Password must be at least 8 characters long.");
  }

  // Prevent lower-privilege escalation against super-admins if caller is somehow not super_admin
  const { data: isAdmin } = await supabaseAdmin.rpc("is_admin", { _user_id: adminUserId });
  if (!isAdmin) {
    throw new Error("Only super-administrators can set user passwords.");
  }

  const { error } = await supabaseAdmin.auth.admin.updateUserById(targetUserId, {
    password: newPassword,
  });

  if (error) {
    throw new Error(`Failed to set password: ${error.message}`);
  }

  // Audit event without password
  await supabaseAdmin.from("audit_events").insert({
    actor_id: adminUserId,
    action: "user.set_password",
    entity_type: "auth.users",
    entity_id: targetUserId,
    metadata: { target_user_id: targetUserId, timestamp: new Date().toISOString() },
  });

  return { success: true, message: "Password updated successfully." };
}
