import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import {
  listSeasonalOffers,
  listVenueRateCards,
  listPropertyEvents,
  listAllPropertyEvents,
  upsertSeasonalOffer,
  upsertVenueRateCard,
  upsertPropertyEvent,
  deletePropertyEvent,
  setPropertyEventActive,
  type SeasonalOfferInput,
  type VenueRateCardInput,
  type PropertyEventInput,
} from "./seasonal.server";

// ---- Public reads (no auth) -------------------------------------------------

export const listSeasonalOffersFn = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return listSeasonalOffers(supabaseAdmin);
});

export const listVenueRateCardsFn = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return listVenueRateCards(supabaseAdmin);
});

export const listPropertyEventsFn = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return listPropertyEvents(supabaseAdmin);
});

// ---- Admin CRUD (manager) ---------------------------------------------------

const seasonalOfferSchema = z.object({
  code: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  weekday_rate_cents: z.number().int().min(0),
  weekend_rate_cents: z.number().int().min(0),
  weekday_label: z.string().optional(),
  weekend_label: z.string().optional(),
  effective_from: z.string(),
  effective_to: z.string(),
  promotion_code: z.string().nullable().optional(),
  is_active: z.boolean().optional(),
  sort_order: z.number().int().optional(),
});

export const upsertSeasonalOfferFn = createServerFn({ method: "POST" })
  .validator((d) => seasonalOfferSchema.parse(d))
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) =>
    upsertSeasonalOffer(context.supabase, data as unknown as SeasonalOfferInput),
  );

const venueRateCardSchema = z.object({
  code: z.string().min(1),
  label: z.string().min(1),
  description: z.string().nullable().optional(),
  weekday_rate_cents: z.number().int().min(0),
  weekend_rate_cents: z.number().int().min(0),
  weekday_label: z.string().optional(),
  weekend_label: z.string().optional(),
  duration_hours: z.number().int().min(1).optional(),
  max_guests: z.number().int().nullable().optional(),
  includes: z.array(z.string()).optional(),
  excludes_weddings: z.boolean().optional(),
  catering_offer_note: z.string().nullable().optional(),
  catering_weekday_rate_cents: z.number().int().nullable().optional(),
  inquiry_category: z.string().optional(),
  is_active: z.boolean().optional(),
  sort_order: z.number().int().optional(),
});

export const upsertVenueRateCardFn = createServerFn({ method: "POST" })
  .validator((d) => venueRateCardSchema.parse(d))
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) =>
    upsertVenueRateCard(context.supabase, data as unknown as VenueRateCardInput),
  );

const propertyEventSchema = z.object({
  code: z.string().min(1),
  title: z.string().min(1),
  subtitle: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  event_date: z.string(),
  end_date: z.string().nullable().optional(),
  start_time: z.string().nullable().optional(),
  end_time: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  ticket_url: z.string().nullable().optional(),
  image_url: z.string().nullable().optional(),
  is_tentative: z.boolean().optional(),
  is_confirmed: z.boolean().optional(),
  includes_overnight_access: z.boolean().optional(),
  sort_order: z.number().int().optional(),
  is_active: z.boolean().optional(),
});

export const upsertPropertyEventFn = createServerFn({ method: "POST" })
  .validator((d) => propertyEventSchema.parse(d))
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) =>
    upsertPropertyEvent(context.supabase, data as unknown as PropertyEventInput),
  );

export const listAllPropertyEventsFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => listAllPropertyEvents(context.supabase));

const deleteEventSchema = z.object({ code: z.string().min(1) });

export const deletePropertyEventFn = createServerFn({ method: "POST" })
  .validator((d) => deleteEventSchema.parse(d))
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) => deletePropertyEvent(context.supabase, data.code));

const toggleEventSchema = z.object({ code: z.string().min(1), is_active: z.boolean() });

export const togglePropertyEventFn = createServerFn({ method: "POST" })
  .validator((d) => toggleEventSchema.parse(d))
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) =>
    setPropertyEventActive(context.supabase, data.code, data.is_active),
  );

// ---- Public single-event read by code (no auth) ---------------------------

export const getPropertyEventByCodeFn = createServerFn({ method: "GET" })
  .validator((d) => z.object({ code: z.string().min(1) }).parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("property_events")
      .select("*")
      .eq("code", data.code)
      .eq("is_active", true)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw new Error("Event not found");
    return row as unknown as import("./seasonal.server").PropertyEventRow;
  });
