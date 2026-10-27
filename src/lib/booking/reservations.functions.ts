import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import {
  searchAvailability,
  publicSearchAvailability,
  type AvailabilityQuery,
} from "./availability.server";
import { computeQuote, type QuoteInput } from "./pricing.server";
import {
  createReservation,
  createBlock,
  releaseBlock,
  cancelReservation,
  amendReservation,
  groupPickup,
  checkIn,
  checkOut,
  markNoShow,
  listReservations,
  getReservation,
  listBlocks,
  expireStaleHolds,
  createGroup,
  listGroups,
  releaseGroup,
  buildCalendar,
  type CreateReservationInput,
  type CreateBlockInput,
  type AmendInput,
  type GroupPickupInput,
} from "./reservations.server";

const availabilitySchema = z.object({
  checkin_date: z.string(),
  checkout_date: z.string(),
  adults: z.number().int().min(1),
  children: z.number().int().min(0).default(0),
  rooms: z.number().int().min(1).default(1),
  room_type_id: z.string().optional(),
  pet_policy: z.string().optional(),
  accessibility_required: z.boolean().optional(),
});

/** Public availability search — no auth required, returns only safe data. */
export const searchAvailabilityFn = createServerFn({ method: "GET" })
  .validator((d) => availabilitySchema.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    return publicSearchAvailability(supabaseAdmin, data as unknown as AvailabilityQuery);
  });

/** Staff availability search — same engine, staff-scoped. */
export const staffSearchAvailabilityFn = createServerFn({ method: "GET" })
  .validator((d) => availabilitySchema.parse(d))
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) => {
    return searchAvailability(context.supabase, data as unknown as AvailabilityQuery);
  });

const quoteSchema = z.object({
  units: z.array(
    z.object({
      unit_id: z.string(),
      unit_code: z.string(),
      base_rate_cents: z.number().int(),
      max_adults: z.number().int(),
      max_children: z.number().int(),
    }),
  ),
  checkin_date: z.string(),
  checkout_date: z.string(),
  adults: z.number().int().min(1),
  children: z.number().int().min(0).default(0),
  promotion_code: z.string().optional(),
});

/** Public quote — server-calculated, no auth. */
export const computeQuoteFn = createServerFn({ method: "POST" })
  .validator((d) => quoteSchema.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    return computeQuote(supabaseAdmin, data as unknown as QuoteInput);
  });

const reservationSchema = z.object({
  guest_name: z.string().min(1),
  guest_email: z.string(),
  guest_phone: z.string().optional(),
  source: z.string().optional(),
  status: z.string().optional(),
  currency: z.string().optional(),
  total_cents: z.number().int().min(0),
  policy_version: z.string().optional(),
  hold_minutes: z.number().int().optional(),
  checkin_date: z.string(),
  checkout_date: z.string(),
  adults: z.number().int().min(0),
  children: z.number().int().min(0),
  units: z.array(
    z.object({
      unit_id: z.string(),
      checkin_date: z.string(),
      checkout_date: z.string(),
      adults: z.number().int().min(0),
      children: z.number().int().min(0),
    }),
  ),
  group_id: z.string().optional(),
});

export const createReservationFn = createServerFn({ method: "POST" })
  .validator((d) => reservationSchema.parse(d))
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) =>
    createReservation(context.supabase, context.userId, data as unknown as CreateReservationInput),
  );

const blockSchema = z.object({
  unit_id: z.string(),
  checkin_date: z.string(),
  checkout_date: z.string(),
  owner_type: z.enum(["maintenance", "owner", "group"]),
  reason: z.string().optional(),
  group_id: z.string().optional(),
});

export const createBlockFn = createServerFn({ method: "POST" })
  .validator((d) => blockSchema.parse(d))
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) =>
    createBlock(context.supabase, context.userId, data as unknown as CreateBlockInput),
  );

export const releaseBlockFn = createServerFn({ method: "POST" })
  .validator((d) => z.object({ block_id: z.string() }).parse(d))
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) =>
    releaseBlock(context.supabase, context.userId, data.block_id),
  );

export const cancelReservationFn = createServerFn({ method: "POST" })
  .validator((d) => z.object({ reservation_id: z.string() }).parse(d))
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) =>
    cancelReservation(context.supabase, context.userId, data.reservation_id),
  );

const amendSchema = z.object({
  reservation_id: z.string(),
  units: z.array(
    z.object({
      unit_id: z.string(),
      checkin_date: z.string(),
      checkout_date: z.string(),
      adults: z.number().int().min(0),
      children: z.number().int().min(0),
    }),
  ),
  checkin_date: z.string(),
  checkout_date: z.string(),
  total_cents: z.number().int().min(0),
  adults: z.number().int().min(0),
  children: z.number().int().min(0),
});

export const amendReservationFn = createServerFn({ method: "POST" })
  .validator((d) => amendSchema.parse(d))
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) =>
    amendReservation(context.supabase, context.userId, data as unknown as AmendInput),
  );

const groupPickupSchema = z.object({
  group_id: z.string(),
  unit_id: z.string(),
  checkin_date: z.string(),
  checkout_date: z.string(),
  guest_name: z.string().min(1),
  guest_email: z.string(),
  guest_phone: z.string().optional(),
  adults: z.number().int().min(0),
  children: z.number().int().min(0),
});

export const groupPickupFn = createServerFn({ method: "POST" })
  .validator((d) => groupPickupSchema.parse(d))
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) =>
    groupPickup(context.supabase, context.userId, data as unknown as GroupPickupInput),
  );

export const checkInFn = createServerFn({ method: "POST" })
  .validator((d) => z.object({ reservation_id: z.string() }).parse(d))
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) =>
    checkIn(context.supabase, context.userId, data.reservation_id),
  );

export const checkOutFn = createServerFn({ method: "POST" })
  .validator((d) => z.object({ reservation_id: z.string() }).parse(d))
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) =>
    checkOut(context.supabase, context.userId, data.reservation_id),
  );

export const markNoShowFn = createServerFn({ method: "POST" })
  .validator((d) => z.object({ reservation_id: z.string() }).parse(d))
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) =>
    markNoShow(context.supabase, context.userId, data.reservation_id),
  );

export const listReservationsFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((d) =>
    z
      .object({
        status: z.string().optional(),
        from: z.string().optional(),
        to: z.string().optional(),
        group_id: z.string().optional(),
        search: z.string().optional(),
        limit: z.number().int().optional(),
        offset: z.number().int().optional(),
      })
      .optional()
      .default({}),
  )
  .handler(async ({ context, data }) =>
    listReservations(context.supabase, data as Parameters<typeof listReservations>[1]),
  );

export const getReservationFn = createServerFn({ method: "GET" })
  .validator((d) => z.object({ reservation_id: z.string() }).parse(d))
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) => getReservation(context.supabase, data.reservation_id));

export const listBlocksFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => listBlocks(context.supabase));

export const expireStaleHoldsFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => expireStaleHolds(context.supabase, context.userId));

const groupSchema = z.object({
  name: z.string().min(1),
  contact_name: z.string().optional(),
  contact_email: z.string().optional(),
  contact_phone: z.string().optional(),
  checkin_date: z.string().optional(),
  checkout_date: z.string().optional(),
  release_date: z.string().optional(),
  payment_responsibility: z.enum(["organizer", "guest"]).optional(),
});

export const createGroupFn = createServerFn({ method: "POST" })
  .validator((d) => groupSchema.parse(d))
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) => createGroup(context.supabase, context.userId, data));

export const listGroupsFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => listGroups(context.supabase));

export const releaseGroupFn = createServerFn({ method: "POST" })
  .validator((d) => z.object({ group_id: z.string() }).parse(d))
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) =>
    releaseGroup(context.supabase, context.userId, data.group_id),
  );

const calendarSchema = z.object({
  start_date: z.string(),
  end_date: z.string(),
});

export const buildCalendarFn = createServerFn({ method: "GET" })
  .validator((d) => calendarSchema.parse(d))
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) =>
    buildCalendar(context.supabase, data.start_date, data.end_date),
  );
