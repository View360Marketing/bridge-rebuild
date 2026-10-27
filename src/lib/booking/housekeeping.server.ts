import type { SupabaseClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { todayPropertyLocal, addDays } from "./dates";

/**
 * Housekeeping & maintenance — operational readiness separate from overnight occupancy.
 * Cleanliness affects arrival readiness, not historical occupancy.
 * A dirty room does not block unrelated future dates indefinitely.
 */

export type HousekeepingTask = {
  id: string;
  unit_id: string;
  unit_code: string;
  public_name: string | null;
  task_date: string;
  status: string;
  priority: string;
  is_turnover: boolean;
  assigned_to: string | null;
  completed_at: string | null;
  inspected_by: string | null;
  inspected_at: string | null;
  notes: string | null;
  reservation_id: string | null;
};

export type UnitCleanliness = {
  id: string;
  unit_code: string;
  public_name: string | null;
  cleanliness_state: string;
};

async function requireStaff(supabase: SupabaseClient, userId: string): Promise<void> {
  const { data } = await supabase.rpc("is_staff", { _user_id: userId });
  if (!data) throw new Error("Staff role required for this operation.");
}

async function requireManager(supabase: SupabaseClient, userId: string): Promise<void> {
  const { data } = await supabase.rpc("is_manager", { _user_id: userId });
  if (!data) throw new Error("Manager role required for this operation.");
}

/** List housekeeping tasks for a date. Housekeeping sees only minimum necessary data. */
export async function listHousekeepingTasks(
  supabase: SupabaseClient,
  date?: string,
): Promise<HousekeepingTask[]> {
  const taskDate = date ?? todayPropertyLocal();
  const { data, error } = await supabase
    .from("housekeeping_tasks")
    .select(
      "id, unit_id, task_date, status, priority, is_turnover, assigned_to, completed_at, inspected_by, inspected_at, notes, reservation_id, units(unit_code, public_name)",
    )
    .eq("task_date", taskDate)
    .order("priority", { ascending: false });
  if (error) throw new Error(error.message);
  return ((data ?? []) as unknown as Array<{
    id: string;
    unit_id: string;
    task_date: string;
    status: string;
    priority: string;
    is_turnover: boolean;
    assigned_to: string | null;
    completed_at: string | null;
    inspected_by: string | null;
    inspected_at: string | null;
    notes: string | null;
    reservation_id: string | null;
    units: { unit_code: string; public_name: string | null } | null;
  }>).map((t) => ({
    id: t.id,
    unit_id: t.unit_id,
    unit_code: t.units?.unit_code ?? "",
    public_name: t.units?.public_name ?? null,
    task_date: t.task_date,
    status: t.status,
    priority: t.priority,
    is_turnover: t.is_turnover,
    assigned_to: t.assigned_to,
    completed_at: t.completed_at,
    inspected_by: t.inspected_by,
    inspected_at: t.inspected_at,
    notes: t.notes,
    reservation_id: t.reservation_id,
  }));
}

/** List all units with their cleanliness state. */
export async function listUnitCleanliness(supabase: SupabaseClient): Promise<UnitCleanliness[]> {
  const { data, error } = await supabase
    .from("units")
    .select("id, unit_code, public_name, cleanliness_state")
    .eq("is_archived", false)
    .order("unit_code");
  if (error) throw new Error(error.message);
  return (data ?? []) as UnitCleanliness[];
}

/**
 * Create a turnover task idempotently for a departing reservation.
 * If a task already exists for that unit+date+reservation, return it.
 * Same-day arrivals get 'turnover' priority.
 */
export async function createTurnoverTask(
  supabase: SupabaseClient,
  userId: string,
  input: { unit_id: string; reservation_id: string; task_date: string; same_day_arrival: boolean },
): Promise<HousekeepingTask> {
  await requireStaff(supabase, userId);

  // Idempotent: check for existing task for this unit+date+reservation.
  const { data: existing } = await supabaseAdmin
    .from("housekeeping_tasks")
    .select("id")
    .eq("unit_id", input.unit_id)
    .eq("task_date", input.task_date)
    .eq("reservation_id", input.reservation_id)
    .maybeSingle();
  if (existing) {
    const { data, error } = await supabaseAdmin
      .from("housekeeping_tasks")
      .select(
        "id, unit_id, task_date, status, priority, is_turnover, assigned_to, completed_at, inspected_by, inspected_at, notes, reservation_id, units(unit_code, public_name)",
      )
      .eq("id", (existing as { id: string }).id)
      .single();
    if (error) throw new Error(error.message);
    return data as unknown as HousekeepingTask;
  }

  const { data, error } = await supabaseAdmin
    .from("housekeeping_tasks")
    .insert({
      unit_id: input.unit_id,
      task_date: input.task_date,
      status: "pending",
      priority: input.same_day_arrival ? "turnover" : "normal",
      is_turnover: true,
      reservation_id: input.reservation_id,
    })
    .select(
      "id, unit_id, task_date, status, priority, is_turnover, assigned_to, completed_at, inspected_by, inspected_at, notes, reservation_id, units(unit_code, public_name)",
    )
    .single();
  if (error) throw new Error(error.message);
  return data as unknown as HousekeepingTask;
}

/** Update task status (pending → in_progress → inspected → complete). */
export async function updateTaskStatus(
  supabase: SupabaseClient,
  userId: string,
  taskId: string,
  status: "pending" | "in_progress" | "inspected" | "complete",
): Promise<void> {
  await requireStaff(supabase, userId);
  const now = new Date().toISOString();
  const patch: {
    status: string;
    updated_at: string;
    completed_at?: string;
    inspected_by?: string;
    inspected_at?: string;
  } = { status, updated_at: now };
  if (status === "complete") {
    patch.completed_at = now;
  }
  if (status === "inspected") {
    patch.inspected_by = userId;
    patch.inspected_at = now;
  }
  const { error } = await supabaseAdmin.from("housekeeping_tasks").update(patch).eq("id", taskId);
  if (error) throw new Error(error.message);

  // If completing, set unit cleanliness to clean (ready for next arrival).
  if (status === "complete") {
    const { data: task } = await supabaseAdmin
      .from("housekeeping_tasks")
      .select("unit_id")
      .eq("id", taskId)
      .single();
    if (task) {
      await supabaseAdmin
        .from("units")
        .update({ cleanliness_state: "clean" })
        .eq("id", (task as { unit_id: string }).unit_id);
    }
  }
}

/** Assign a task to a staff member. */
export async function assignTask(
  supabase: SupabaseClient,
  userId: string,
  taskId: string,
  assignedTo: string,
): Promise<void> {
  await requireStaff(supabase, userId);
  const { error } = await supabaseAdmin
    .from("housekeeping_tasks")
    .update({ assigned_to: assignedTo })
    .eq("id", taskId);
  if (error) throw new Error(error.message);
}

/** Set a unit's cleanliness state (e.g., dirty on checkout). */
export async function setUnitCleanliness(
  supabase: SupabaseClient,
  userId: string,
  unitId: string,
  state: "clean" | "dirty" | "cleaning" | "inspected" | "out_of_service",
): Promise<void> {
  await requireStaff(supabase, userId);
  const { error } = await supabaseAdmin
    .from("units")
    .update({ cleanliness_state: state })
    .eq("id", unitId);
  if (error) throw new Error(error.message);
}

/** Create a maintenance block — claims inventory through the booking engine. */
export async function createMaintenanceBlock(
  supabase: SupabaseClient,
  userId: string,
  input: { unit_id: string; checkin_date: string; checkout_date: string; reason: string },
): Promise<{ block_id: string }> {
  await requireManager(supabase, userId);
  const { data, error } = await supabaseAdmin.rpc("claim_block", {
    p_unit_id: input.unit_id,
    p_checkin_date: input.checkin_date,
    p_checkout_date: input.checkout_date,
    p_owner_type: "maintenance",
    p_reason: input.reason,
    p_group_id: null,
    p_created_by: userId,
  } as unknown as Parameters<typeof supabaseAdmin.rpc>[1]);
  if (error) throw new Error(error.message);
  return data as { block_id: string };
}

/** List maintenance blocks. */
export async function listMaintenanceBlocks(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("blocks")
    .select("*, units(unit_code, public_name)")
    .eq("owner_type", "maintenance")
    .order("checkin_date");
  if (error) throw new Error(error.message);
  return data ?? [];
}

/** Release a maintenance block. */
export async function releaseMaintenanceBlock(
  supabase: SupabaseClient,
  userId: string,
  blockId: string,
): Promise<void> {
  await requireManager(supabase, userId);
  const { error } = await supabaseAdmin.rpc("release_block", { p_block_id: blockId });
  if (error) throw new Error(error.message);
}

/** Get units that need cleaning today (dirty or cleaning state). */
export async function getUnitsNeedingCleaning(
  supabase: SupabaseClient,
): Promise<UnitCleanliness[]> {
  const all = await listUnitCleanliness(supabase);
  return all.filter((u) => u.cleanliness_state === "dirty" || u.cleanliness_state === "cleaning");
}

export { todayPropertyLocal, addDays };