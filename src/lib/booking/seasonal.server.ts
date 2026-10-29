import type { SupabaseClient } from "@supabase/supabase-js";

export type SeasonalOfferRow = {
  id: string;
  code: string;
  title: string;
  description: string;
  weekday_rate_cents: number;
  weekend_rate_cents: number;
  weekday_label: string;
  weekend_label: string;
  effective_from: string;
  effective_to: string;
  promotion_code: string | null;
  is_active: boolean;
  sort_order: number;
};

export type VenueRateCardRow = {
  id: string;
  code: string;
  label: string;
  description: string | null;
  weekday_rate_cents: number;
  weekend_rate_cents: number;
  weekday_label: string;
  weekend_label: string;
  duration_hours: number;
  max_guests: number | null;
  includes: string[];
  excludes_weddings: boolean;
  catering_offer_note: string | null;
  catering_weekday_rate_cents: number | null;
  inquiry_category: string;
  is_active: boolean;
  sort_order: number;
};

export type PropertyEventRow = {
  id: string;
  code: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  event_date: string;
  end_date: string | null;
  start_time: string | null;
  end_time: string | null;
  location: string | null;
  ticket_url: string | null;
  image_url: string | null;
  is_tentative: boolean;
  is_confirmed: boolean;
  includes_overnight_access: boolean;
  sort_order: number;
  is_active: boolean;
};

/** Public: active seasonal offers ordered by sort_order. */
export async function listSeasonalOffers(supabase: SupabaseClient): Promise<SeasonalOfferRow[]> {
  const { data, error } = await supabase
    .from("seasonal_offers")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as SeasonalOfferRow[];
}

/** Public: active venue rate cards ordered by sort_order. */
export async function listVenueRateCards(supabase: SupabaseClient): Promise<VenueRateCardRow[]> {
  const { data, error } = await supabase
    .from("venue_rate_cards")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as VenueRateCardRow[];
}

/** Public: active property events ordered by event_date then sort_order. */
export async function listPropertyEvents(supabase: SupabaseClient): Promise<PropertyEventRow[]> {
  const { data, error } = await supabase
    .from("property_events")
    .select("*")
    .eq("is_active", true)
    .order("event_date,sort_order");
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as PropertyEventRow[];
}

/** Admin: all property events (including inactive) ordered by event_date. */
export async function listAllPropertyEvents(supabase: SupabaseClient): Promise<PropertyEventRow[]> {
  const { data, error } = await supabase
    .from("property_events")
    .select("*")
    .order("event_date,sort_order");
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as PropertyEventRow[];
}

// ---- Admin CRUD (staff/manager) -------------------------------------------

export type SeasonalOfferInput = {
  code: string;
  title: string;
  description: string;
  weekday_rate_cents: number;
  weekend_rate_cents: number;
  weekday_label?: string;
  weekend_label?: string;
  effective_from: string;
  effective_to: string;
  promotion_code?: string | null;
  is_active?: boolean;
  sort_order?: number;
};

export type VenueRateCardInput = {
  code: string;
  label: string;
  description?: string | null;
  weekday_rate_cents: number;
  weekend_rate_cents: number;
  weekday_label?: string;
  weekend_label?: string;
  duration_hours?: number;
  max_guests?: number | null;
  includes?: string[];
  excludes_weddings?: boolean;
  catering_offer_note?: string | null;
  catering_weekday_rate_cents?: number | null;
  inquiry_category?: string;
  is_active?: boolean;
  sort_order?: number;
};

export type PropertyEventInput = {
  code: string;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  event_date: string;
  end_date?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  location?: string | null;
  ticket_url?: string | null;
  image_url?: string | null;
  is_tentative?: boolean;
  is_confirmed?: boolean;
  includes_overnight_access?: boolean;
  sort_order?: number;
  is_active?: boolean;
};

export async function upsertSeasonalOffer(
  supabase: SupabaseClient,
  input: SeasonalOfferInput,
): Promise<SeasonalOfferRow> {
  const { data, error } = await supabase
    .from("seasonal_offers")
    .upsert(
      {
        code: input.code,
        title: input.title,
        description: input.description,
        weekday_rate_cents: input.weekday_rate_cents,
        weekend_rate_cents: input.weekend_rate_cents,
        weekday_label: input.weekday_label ?? "Monday–Thursday",
        weekend_label: input.weekend_label ?? "Friday–Sunday",
        effective_from: input.effective_from,
        effective_to: input.effective_to,
        promotion_code: input.promotion_code ?? null,
        is_active: input.is_active ?? true,
        sort_order: input.sort_order ?? 0,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "code" },
    )
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as unknown as SeasonalOfferRow;
}

export async function upsertVenueRateCard(
  supabase: SupabaseClient,
  input: VenueRateCardInput,
): Promise<VenueRateCardRow> {
  const { data, error } = await supabase
    .from("venue_rate_cards")
    .upsert(
      {
        code: input.code,
        label: input.label,
        description: input.description ?? null,
        weekday_rate_cents: input.weekday_rate_cents,
        weekend_rate_cents: input.weekend_rate_cents,
        weekday_label: input.weekday_label ?? "Monday–Friday",
        weekend_label: input.weekend_label ?? "Saturday–Sunday",
        duration_hours: input.duration_hours ?? 5,
        max_guests: input.max_guests ?? null,
        includes: input.includes ?? [],
        excludes_weddings: input.excludes_weddings ?? false,
        catering_offer_note: input.catering_offer_note ?? null,
        catering_weekday_rate_cents: input.catering_weekday_rate_cents ?? null,
        inquiry_category: input.inquiry_category ?? "General",
        is_active: input.is_active ?? true,
        sort_order: input.sort_order ?? 0,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "code" },
    )
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as unknown as VenueRateCardRow;
}

export async function upsertPropertyEvent(
  supabase: SupabaseClient,
  input: PropertyEventInput,
): Promise<PropertyEventRow> {
  const { data, error } = await supabase
    .from("property_events")
    .upsert(
      {
        code: input.code,
        title: input.title,
        subtitle: input.subtitle ?? null,
        description: input.description ?? null,
        event_date: input.event_date,
        end_date: input.end_date ?? null,
        start_time: input.start_time ?? null,
        end_time: input.end_time ?? null,
        location: input.location ?? null,
        ticket_url: input.ticket_url ?? null,
        image_url: input.image_url ?? null,
        is_tentative: input.is_tentative ?? false,
        is_confirmed: input.is_confirmed ?? true,
        includes_overnight_access: input.includes_overnight_access ?? false,
        sort_order: input.sort_order ?? 0,
        is_active: input.is_active ?? true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "code" },
    )
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as unknown as PropertyEventRow;
}

export async function deletePropertyEvent(supabase: SupabaseClient, code: string): Promise<void> {
  const { error } = await supabase.from("property_events").delete().eq("code", code);
  if (error) throw new Error(error.message);
}

export async function setPropertyEventActive(
  supabase: SupabaseClient,
  code: string,
  isActive: boolean,
): Promise<void> {
  const { error } = await supabase
    .from("property_events")
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq("code", code);
  if (error) throw new Error(error.message);
}
