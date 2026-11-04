import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Authoritative pricing engine. All money is integer cents.
 * Runs ONLY on the server. Client-supplied totals are never trusted.
 *
 * Precedence (highest first):
 *   1. per-unit date override (date_rate_overrides.unit_id)
 *   2. per-rate-plan date override (date_rate_overrides.rate_plan_id)
 *   3. weekend rate (if the night is a weekend day and a weekend rate is set)
 *   4. base nightly rate from the unit's rate plan
 *   5. unit.base_rate_cents fallback
 */

export type RatePlanRow = {
  id: string;
  code: string;
  name: string;
  room_type_id: string | null;
  unit_id: string | null;
  base_nightly_cents: number;
  weekend_nightly_cents: number | null;
  additional_adult_cents: number;
  additional_child_cents: number;
  weekend_days: number[];
  is_active: boolean;
  effective_from: string | null;
  effective_to: string | null;
};

export type DateOverrideRow = {
  rate_plan_id: string | null;
  unit_id: string | null;
  stay_date: string;
  nightly_cents: number;
};

export type FeeRow = {
  id: string;
  code: string;
  name: string;
  amount_cents: number;
  basis: "per_stay" | "per_night" | "per_person" | "per_person_per_night";
  is_taxable: boolean;
  is_active: boolean;
};

export type TaxRow = {
  id: string;
  code: string;
  name: string;
  rate_percent: number;
  is_active: boolean;
};

export type PromotionRow = {
  id: string;
  code: string;
  name: string;
  discount_percent: number | null;
  discount_cents: number | null;
  max_redemptions: number | null;
  redemptions_count: number;
  effective_from: string | null;
  effective_to: string | null;
  is_active: boolean;
  mechanic: string | null;
};

export type UnitPricingInput = {
  unit_id: string;
  unit_code: string;
  base_rate_cents: number;
  max_adults: number;
  max_children: number;
  room_type_id?: string | null;
};

export type QuoteLine = {
  label: string;
  amount_cents: number;
  kind: "room" | "fee" | "tax" | "discount";
  sort_order: number;
};

export type QuoteResult = {
  nights: number;
  nightly_breakdown: { date: string; amount_cents: number; reason: string }[];
  subtotal_cents: number;
  fees_cents: number;
  taxes_cents: number;
  discount_cents: number;
  total_cents: number;
  lines: QuoteLine[];
  currency: string;
};

export type QuoteInput = {
  units: UnitPricingInput[];
  checkin_date: string;
  checkout_date: string;
  adults: number;
  children: number;
  promotion_code?: string;
};

async function loadRatePlans(supabase: SupabaseClient): Promise<RatePlanRow[]> {
  const { data, error } = await supabase.from("rate_plans").select("*").eq("is_active", true);
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as RatePlanRow[];
}

async function loadOverrides(
  supabase: SupabaseClient,
  checkin: string,
  checkout: string,
): Promise<DateOverrideRow[]> {
  const { data, error } = await supabase
    .from("date_rate_overrides")
    .select("rate_plan_id, unit_id, stay_date, nightly_cents")
    .gte("stay_date", checkin)
    .lt("stay_date", checkout);
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as DateOverrideRow[];
}

async function loadFees(supabase: SupabaseClient): Promise<FeeRow[]> {
  const { data, error } = await supabase.from("fees").select("*").eq("is_active", true);
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as FeeRow[];
}

async function loadTaxes(supabase: SupabaseClient): Promise<TaxRow[]> {
  const { data, error } = await supabase.from("taxes").select("*").eq("is_active", true);
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as TaxRow[];
}

async function loadPromotion(supabase: SupabaseClient, code: string): Promise<PromotionRow | null> {
  if (!code) return null;
  const { data, error } = await supabase
    .from("promotions")
    .select("*")
    .eq("code", code)
    .eq("is_active", true)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as unknown as PromotionRow) ?? null;
}

/** Load the active third_night_free promotion (used when no explicit code is
 * supplied, so the seasonal "book two nights, third night free" offer is
 * honoured automatically). Only the first active one is applied — we do not
 * stack promotions. */
async function loadActiveThirdNightFreePromotion(
  supabase: SupabaseClient,
): Promise<PromotionRow | null> {
  const { data, error } = await supabase
    .from("promotions")
    .select("*")
    .eq("is_active", true)
    .eq("mechanic", "third_night_free")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as unknown as PromotionRow) ?? null;
}

/** Resolve the nightly rate in cents for one unit on one date.
 *
 * Plan selection precedence (first match wins):
 *   1. per-unit plan (unit_id = this unit)
 *   2. per-room-type plan (room_type_id = this unit's room type, unit_id null)
 *   3. catch-all plan (room_type_id null, unit_id null)
 *
 * For the selected plan, nightly resolution precedence:
 *   a. per-unit date override
 *   b. per-plan date override
 *   c. weekend rate (if the night is a weekend day and a weekend rate is set)
 *   d. base nightly rate
 *   e. unit.base_rate_cents fallback
 */
export function resolveNightlyRate(
  unit: UnitPricingInput,
  date: string,
  plans: RatePlanRow[],
  overrides: DateOverrideRow[],
): { amount: number; reason: string } {
  // 1. per-unit date override
  const unitOverride = overrides.find((o) => o.unit_id === unit.unit_id && o.stay_date === date);
  if (unitOverride) return { amount: unitOverride.nightly_cents, reason: "unit override" };

  // 2. find the best-matching active rate plan for this unit, honouring room_type_id.
  const plan =
    plans.find((p) => p.unit_id === unit.unit_id) ??
    (unit.room_type_id
      ? plans.find((p) => p.room_type_id === unit.room_type_id && p.unit_id === null)
      : undefined) ??
    plans.find((p) => p.room_type_id === null && p.unit_id === null);

  // 3. per-plan override + effective window + weekend/base
  if (plan) {
    const planOverride = overrides.find((o) => o.rate_plan_id === plan.id && o.stay_date === date);
    if (planOverride) return { amount: planOverride.nightly_cents, reason: "plan override" };

    const withinWindow =
      (!plan.effective_from || date >= plan.effective_from) &&
      (!plan.effective_to || date <= plan.effective_to);

    if (withinWindow) {
      // 4. weekend rate
      const dow = new Date(date + "T00:00:00Z").getUTCDay();
      if (plan.weekend_nightly_cents != null && plan.weekend_days.includes(dow)) {
        return { amount: plan.weekend_nightly_cents, reason: "weekend" };
      }
      // 5. base nightly
      return { amount: plan.base_nightly_cents, reason: "base" };
    }
  }

  // 6. unit base fallback
  return { amount: unit.base_rate_cents, reason: "unit base" };
}

/** Compute an authoritative quote. Server-only. */
export async function computeQuote(
  supabase: SupabaseClient,
  input: QuoteInput,
): Promise<QuoteResult> {
  // If an explicit promotion_code is supplied, look it up; otherwise fall back
  // to the active third_night_free promotion so the seasonal offer is honoured
  // automatically without requiring the client to pass a code.
  let promotion = await loadPromotion(supabase, input.promotion_code ?? "");
  if (!promotion) {
    promotion = await loadActiveThirdNightFreePromotion(supabase);
  }

  const [plans, overrides, fees, taxes] = await Promise.all([
    loadRatePlans(supabase),
    loadOverrides(supabase, input.checkin_date, input.checkout_date),
    loadFees(supabase),
    loadTaxes(supabase),
  ]);

  const nights: string[] = [];
  for (let d = input.checkin_date; d < input.checkout_date; d = addDay(d)) nights.push(d);

  const nightly_breakdown: { date: string; amount_cents: number; reason: string }[] = [];
  let subtotal = 0;

  for (const unit of input.units) {
    for (const night of nights) {
      const { amount, reason } = resolveNightlyRate(unit, night, plans, overrides);
      nightly_breakdown.push({ date: night, amount_cents: amount, reason });
      subtotal += amount;
    }
  }

  // additional-person fees — use the same room-type-aware plan matching as
  // resolveNightlyRate so per-room-type plans are honoured here too.
  let additionalPerson = 0;
  for (const unit of input.units) {
    const plan =
      plans.find((p) => p.unit_id === unit.unit_id) ??
      (unit.room_type_id
        ? plans.find((p) => p.room_type_id === unit.room_type_id && p.unit_id === null)
        : undefined) ??
      plans.find((p) => p.room_type_id === null && p.unit_id === null);
    const extraAdults = Math.max(0, input.adults - unit.max_adults);
    additionalPerson += extraAdults * (plan?.additional_adult_cents ?? 0);
    additionalPerson += input.children * (plan?.additional_child_cents ?? 0);
  }

  const lines: QuoteLine[] = [];
  let sort = 0;
  for (const b of nightly_breakdown) {
    lines.push({
      label: `Night ${b.date} (${b.reason})`,
      amount_cents: b.amount_cents,
      kind: "room",
      sort_order: sort++,
    });
  }

  // fees
  let feesTotal = 0;
  for (const fee of fees) {
    let amt = 0;
    if (fee.basis === "per_stay") amt = fee.amount_cents;
    else if (fee.basis === "per_night") amt = fee.amount_cents * nights.length;
    else if (fee.basis === "per_person") amt = fee.amount_cents * (input.adults + input.children);
    else if (fee.basis === "per_person_per_night")
      amt = fee.amount_cents * (input.adults + input.children) * nights.length;
    if (amt > 0) {
      feesTotal += amt;
      lines.push({ label: fee.name, amount_cents: amt, kind: "fee", sort_order: sort++ });
    }
  }
  if (additionalPerson > 0) {
    feesTotal += additionalPerson;
    lines.push({
      label: "Additional guests",
      amount_cents: additionalPerson,
      kind: "fee",
      sort_order: sort++,
    });
  }

  // discount
  let discount = 0;
  if (promotion) {
    if (promotion.mechanic === "third_night_free") {
      // "Third night free" = the third eligible night's room charge is discounted.
      // NOT a cheapest-night substitution: the actual 3rd night's room charge.
      // Only applies when the stay has at least 3 nights. Longer-stay repeat/
      // stacking/season-boundary rules are unresolved and left for admin review
      // before enabling automatic promotional checkout (promotion.is_active).
      if (nights.length >= 3) {
        const thirdNight = nights[2]!;
        // Only discount the third night if it falls within the promotion's
        // effective window. Nights outside the window (e.g. a stay that
        // straddles the season boundary) are not eligible for the free night.
        const withinPromoWindow =
          (!promotion.effective_from || thirdNight >= promotion.effective_from) &&
          (!promotion.effective_to || thirdNight <= promotion.effective_to);
        if (withinPromoWindow) {
          const thirdNightRoom = nightly_breakdown
            .filter((b) => b.date === thirdNight)
            .reduce((sum, b) => sum + b.amount_cents, 0);
          discount = thirdNightRoom;
        }
      }
    } else if (promotion.discount_percent != null) {
      discount = Math.round(((subtotal + feesTotal) * promotion.discount_percent) / 100);
    } else if (promotion.discount_cents != null) {
      discount = promotion.discount_cents;
    }
    if (discount > 0)
      lines.push({
        label: `Promotion ${promotion.code} — third night free`,
        amount_cents: -discount,
        kind: "discount",
        sort_order: sort++,
      });
  }

  const taxableBase = subtotal + feesTotal - discount;
  let taxesTotal = 0;
  for (const tax of taxes) {
    const t = Math.round((taxableBase * Number(tax.rate_percent)) / 100);
    taxesTotal += t;
    if (t > 0)
      lines.push({
        label: `${tax.name} (${tax.rate_percent}%)`,
        amount_cents: t,
        kind: "tax",
        sort_order: sort++,
      });
  }

  const total = Math.max(0, taxableBase + taxesTotal);

  return {
    nights: nights.length,
    nightly_breakdown,
    subtotal_cents: subtotal,
    fees_cents: feesTotal,
    taxes_cents: taxesTotal,
    discount_cents: discount,
    total_cents: total,
    lines,
    currency: "USD",
  };
}

function addDay(s: string): string {
  const parts = s.split("-").map(Number);
  const y = parts[0] ?? 1970;
  const m = parts[1] ?? 1;
  const d = parts[2] ?? 1;
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + 1);
  const yy = dt.getUTCFullYear();
  const mm = String(dt.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(dt.getUTCDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

export { loadRatePlans, loadOverrides, loadFees, loadTaxes };
