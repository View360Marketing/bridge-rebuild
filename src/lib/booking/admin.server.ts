import type { SupabaseClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export type BootstrapResult = {
  ok: boolean;
  alreadyBootstrapped: boolean;
  email?: string;
  userId?: string;
  message: string;
};

/**
 * One-time server-side bootstrap of the initial super-admin.
 *
 * - Reads BOOTSTRAP_ADMIN_EMAIL / BOOTSTRAP_ADMIN_PASSWORD from server Secrets (never browser).
 * - Refuses once integration_settings.bootstrap_completed_at is set (disabled after success).
 * - Creates the auth user via the Auth Admin API if missing; never resets an existing password.
 * - Assigns the super_admin role if missing (idempotent).
 * - Marks bootstrap complete so it can never re-run.
 */
export async function runBootstrap(): Promise<BootstrapResult> {
  const email = process.env["BOOTSTRAP_ADMIN_EMAIL"];
  const password = process.env["BOOTSTRAP_ADMIN_PASSWORD"];
  if (!email || !password) {
    return {
      ok: false,
      alreadyBootstrapped: false,
      message: "Bootstrap credentials are not configured on the server.",
    };
  }

  const { data: settings } = await supabaseAdmin
    .from("integration_settings")
    .select("bootstrap_completed_at")
    .eq("id", 1)
    .single();

  if (settings?.bootstrap_completed_at) {
    return {
      ok: true,
      alreadyBootstrapped: true,
      message: "Bootstrap already completed. Sign in with your admin account.",
    };
  }

  // Find or create the auth user by email. Never reset an existing password.
  const { data: list, error: listErr } = await supabaseAdmin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });
  if (listErr) {
    return {
      ok: false,
      alreadyBootstrapped: false,
      message: `Unable to list users: ${listErr.message}`,
    };
  }
  const existing = list?.users?.find((u) => u.email?.toLowerCase() === email.toLowerCase());

  let userId: string;
  if (existing) {
    userId = existing.id;
  } else {
    const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (createErr || !created?.user) {
      return {
        ok: false,
        alreadyBootstrapped: false,
        message: `Failed to create admin user: ${createErr?.message ?? "unknown error"}`,
      };
    }
    userId = created.user.id;
  }

  // Assign super_admin role if missing (idempotent).
  const { data: roleRow } = await supabaseAdmin
    .from("user_roles")
    .select("id")
    .eq("user_id", userId)
    .eq("role", "super_admin")
    .maybeSingle();
  if (!roleRow) {
    const { error: roleErr } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: userId, role: "super_admin" });
    if (roleErr) {
      return {
        ok: false,
        alreadyBootstrapped: false,
        message: `Created user but failed to assign super_admin role: ${roleErr.message}`,
      };
    }
  }

  // Disable bootstrap after success.
  await supabaseAdmin
    .from("integration_settings")
    .update({
      bootstrap_completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);

  return {
    ok: true,
    alreadyBootstrapped: false,
    email,
    userId,
    message: "Admin account ready. You can now sign in.",
  };
}

export type StaffInfo = {
  userId: string;
  email?: string;
  roles: string[];
  isStaff: boolean;
  isManager: boolean;
  isAdmin: boolean;
};

/** Read the caller's roles through the RLS-scoped caller client. */
export async function getCurrentStaff(
  supabase: SupabaseClient,
  userId: string,
): Promise<StaffInfo> {
  const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  const roles = (data ?? []).map((r) => r.role as string);
  return {
    userId,
    roles,
    isStaff: roles.some((r) =>
      ["super_admin", "manager", "front_desk", "housekeeping", "read_only"].includes(r),
    ),
    isManager: roles.includes("super_admin") || roles.includes("manager"),
    isAdmin: roles.includes("super_admin"),
  };
}
