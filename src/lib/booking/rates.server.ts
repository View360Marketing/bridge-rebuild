import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Rates & rules management — base rates, date overrides, restrictions,
 * fees, taxes, promotions, policies. Changes affect future quotes only;
 * existing accepted bookings retain snapshots unless explicitly amended.
 */

export type RatePlanInput = {
  code: string;
  name: string;
  room_type_id?: string;
  unit_id?: string;
  base_nightly_cents: number;
  weekend_nightly_cents?: number;
  additional_adult_cents?: number;
  additional_child_cents?: number;
  weekend_days?: number[];
  is_active?: boolean;
  effective_from?: string;
  effective_to?: string;
};

export type DateOverrideInput = {
  unit_id?: string;
  rate_plan_id?: string;
  stay_date: string;
  nightly_cents: number;
  reason?: string;
};

export type RestrictionInput = {
  unit_id?: string;
  room_type_id?: string;
  stay_date: string;
  min_stay?: number;
  max_stay?: number;
  closed_to_arrival?: boolean;
  closed_to_departure?: boolean;
  is_closed?: boolean;
};

async function requireManager(supabase: SupabaseClient, userId: string): Promise<void> {
  const { data } = await supabase.rpc("is_manager", { _user_id: userId });
  if (!data) throw new Error("Manager role required for this operation.");
}

export async function listRatePlans(supabase: SupabaseClient) {
  const { data, error } = await supabase.from("rate_plans").select("*").order("code");
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function upsertRatePlan(
  supabase: SupabaseClient,
  userId: string,
  input: RatePlanInput,
) {
  await requireManager(supabase, userId);
  const { data, error } = await supabase
    .from("rate_plans")
    .insert({
      code: input.code,
      name: input.name,
      room_type_id: input.room_type_id ?? null,
      unit_id: input.unit_id ?? null,
      base_nightly_cents: input.base_nightly_cents,
      weekend_nightly_cents: input.weekend_nightly_cents ?? null,
      additional_adult_cents: input.additional_adult_cents ?? 0,
      additional_child_cents: input.additional_child_cents ?? 0,
      weekend_days: input.weekend_days ?? [5, 6],
      is_active: input.is_active ?? true,
      effective_from: input.effective_from ?? null,
      effective_to: input.effective_to ?? null,
    })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateRatePlan(
  supabase: SupabaseClient,
  userId: string,
  id: string,
  input: Partial<RatePlanInput>,
) {
  await requireManager(supabase, userId);
  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (input["code"] !== undefined) patch["code"] = input["code"];
  if (input["name"] !== undefined) patch["name"] = input["name"];
  if (input["room_type_id"] !== undefined) patch["room_type_id"] = input["room_type_id"] ?? null;
  if (input["unit_id"] !== undefined) patch["unit_id"] = input["unit_id"] ?? null;
  if (input["base_nightly_cents"] !== undefined)
    patch["base_nightly_cents"] = input["base_nightly_cents"];
  if (input["weekend_nightly_cents"] !== undefined)
    patch["weekend_nightly_cents"] = input["weekend_nightly_cents"] ?? null;
  if (input["additional_adult_cents"] !== undefined)
    patch["additional_adult_cents"] = input["additional_adult_cents"];
  if (input["additional_child_cents"] !== undefined)
    patch["additional_child_cents"] = input["additional_child_cents"];
  if (input["weekend_days"] !== undefined) patch["weekend_days"] = input["weekend_days"];
  if (input["is_active"] !== undefined) patch["is_active"] = input["is_active"];
  if (input["effective_from"] !== undefined)
    patch["effective_from"] = input["effective_from"] ?? null;
  if (input["effective_to"] !== undefined) patch["effective_to"] = input["effective_to"] ?? null;
  const { data, error } = await supabase
    .from("rate_plans")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function listDateOverrides(supabase: SupabaseClient) {
  const { data, error } = await supabase.from("date_rate_overrides").select("*").order("stay_date");
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function addDateOverride(
  supabase: SupabaseClient,
  userId: string,
  input: DateOverrideInput,
) {
  await requireManager(supabase, userId);
  if (!input.unit_id && !input.rate_plan_id)
    throw new Error("Either unit_id or rate_plan_id is required.");
  const { data, error } = await supabase
    .from("date_rate_overrides")
    .upsert(
      {
        unit_id: input.unit_id ?? null,
        rate_plan_id: input.rate_plan_id ?? null,
        stay_date: input.stay_date,
        nightly_cents: input.nightly_cents,
        reason: input.reason ?? null,
      },
      { onConflict: input.unit_id ? "unit_id,stay_date" : "rate_plan_id,stay_date" },
    )
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function listRestrictions(supabase: SupabaseClient) {
  const { data, error } = await supabase.from("restrictions").select("*").order("stay_date");
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function addRestriction(
  supabase: SupabaseClient,
  userId: string,
  input: RestrictionInput,
) {
  await requireManager(supabase, userId);
  if (!input.unit_id && !input.room_type_id)
    throw new Error("Either unit_id or room_type_id is required.");
  const { data, error } = await supabase
    .from("restrictions")
    .insert({
      unit_id: input.unit_id ?? null,
      room_type_id: input.room_type_id ?? null,
      stay_date: input.stay_date,
      min_stay: input.min_stay ?? null,
      max_stay: input.max_stay ?? null,
      closed_to_arrival: input.closed_to_arrival ?? false,
      closed_to_departure: input.closed_to_departure ?? false,
      is_closed: input.is_closed ?? false,
    })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function listFees(supabase: SupabaseClient) {
  const { data, error } = await supabase.from("fees").select("*").order("code");
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function listTaxes(supabase: SupabaseClient) {
  const { data, error } = await supabase.from("taxes").select("*").order("code");
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function listPromotions(supabase: SupabaseClient) {
  const { data, error } = await supabase.from("promotions").select("*").order("code");
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function listPolicies(supabase: SupabaseClient) {
  const { data, error } = await supabase.from("policy_versions").select("*").order("version");
  if (error) throw new Error(error.message);
  return data ?? [];
}
