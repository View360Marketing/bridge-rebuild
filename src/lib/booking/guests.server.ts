import type { SupabaseClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { Json } from "@/integrations/supabase/types";

/**
 * Guest profiles — separate from staff auth accounts.
 * Supports reviewed duplicate detection/merging. Protects private info.
 */

export type GuestRow = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  notes: Json | null;
  created_at: string;
  updated_at: string;
};

export type GuestWithReservations = GuestRow & {
  reservations: {
    id: string;
    booking_reference: string;
    status: string;
    checkin_date: string | null;
    checkout_date: string | null;
    total_cents: number;
  }[];
};

export async function listGuests(supabase: SupabaseClient, search?: string): Promise<GuestRow[]> {
  let q = supabase.from("guests").select("*").order("created_at", { ascending: false });
  if (search) {
    q = q.or(`name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);
  }
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return (data ?? []) as GuestRow[];
}

export async function getGuest(
  supabase: SupabaseClient,
  guestId: string,
): Promise<GuestWithReservations> {
  const { data: guest, error } = await supabase
    .from("guests")
    .select("*")
    .eq("id", guestId)
    .single();
  if (error) throw new Error(error.message);

  const { data: reservations } = await supabase
    .from("reservations")
    .select("id, booking_reference, status, checkin_date, checkout_date, total_cents")
    .eq("guest_id", guestId)
    .order("created_at", { ascending: false });

  return {
    ...(guest as GuestRow),
    reservations: (reservations ?? []) as GuestWithReservations["reservations"],
  };
}

/** Find potential duplicate guests by normalized email or phone. Reviewed, not auto-merged. */
export async function findDuplicateGuests(
  supabase: SupabaseClient,
  guestId: string,
): Promise<GuestRow[]> {
  const { data: guest } = await supabase
    .from("guests")
    .select("email, phone")
    .eq("id", guestId)
    .single();
  if (!guest) return [];
  const g = guest as { email: string | null; phone: string | null };
  if (!g.email && !g.phone) return [];

  let q = supabase.from("guests").select("*").neq("id", guestId);
  if (g.email && g.phone) {
    q = q.or(`email.ilike.%${g.email}%,phone.ilike.%${g.phone}%`);
  } else if (g.email) {
    q = q.ilike("email", `%${g.email}%`);
  } else if (g.phone) {
    q = q.ilike("phone", `%${g.phone}%`);
  }
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return (data ?? []) as GuestRow[];
}

/**
 * Merge guests — reviewed, not automatic. Reassigns reservations from source to target,
 * preserving booking references and audit history. Does not merge based on name alone.
 */
export async function mergeGuests(
  supabase: SupabaseClient,
  userId: string,
  sourceId: string,
  targetId: string,
): Promise<{ merged: number }> {
  const { data } = await supabaseAdmin.rpc("is_staff", { _user_id: userId });
  if (!data) throw new Error("Staff role required for this operation.");
  if (sourceId === targetId) throw new Error("Cannot merge a guest into itself.");

  // Reassign all reservations from source to target.
  const { data: reassigned, error: reErr } = await supabaseAdmin
    .from("reservations")
    .update({ guest_id: targetId, updated_at: new Date().toISOString() })
    .eq("guest_id", sourceId)
    .select("id");
  if (reErr) throw new Error(reErr.message);
  const merged = reassigned?.length ?? 0;

  // Soft-delete the source guest (keep the record for audit).
  await supabaseAdmin
    .from("guests")
    .update({
      notes: {
        merged_into: targetId,
        merged_at: new Date().toISOString(),
        merged_by: userId,
      },
      updated_at: new Date().toISOString(),
    })
    .eq("id", sourceId);

  return { merged };
}

/** CSV-safe export — escapes formula injection (=, +, -, @) by prefixing with a single quote. */
export function csvSafe(value: string | null | undefined): string {
  const v = (value ?? "").toString();
  if (/^[=+\-@]/.test(v)) return `'${v}`;
  return v.replace(/"/g, '""');
}

export async function exportGuestsCsv(supabase: SupabaseClient): Promise<string> {
  const guests = await listGuests(supabase);
  const header = ["Name", "Email", "Phone", "Created"];
  const rows = guests.map((g) =>
    [csvSafe(g.name), csvSafe(g.email), csvSafe(g.phone), g.created_at.slice(0, 10)].join(","),
  );
  return [header.join(","), ...rows].join("\n");
}
