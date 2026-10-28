import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import {
  createCheckout,
  getReservationStatus,
  type CheckoutResult,
  type ReservationStatusView,
} from "./payments.server";
import { staffRefund } from "./payments-confirm.server";
import {
  createGuestReservation,
  resolveAccessCapability,
  guestCancelReservation,
} from "./payments-access.server";
import { getStripeConfig } from "./stripe.server";

/** Public: create a guest reservation + inventory hold (no auth; idempotent). */
const guestReservationSchema = z.object({
  guest_name: z.string().min(1),
  guest_email: z.string().email(),
  guest_phone: z.string().optional(),
  checkin_date: z.string(),
  checkout_date: z.string(),
  adults: z.number().int().min(1),
  children: z.number().int().min(0).default(0),
  units: z
    .array(
      z.object({
        unit_id: z.string(),
        checkin_date: z.string(),
        checkout_date: z.string(),
        adults: z.number().int().min(0),
        children: z.number().int().min(0),
      }),
    )
    .min(1),
  total_cents: z.number().int().min(0),
  policy_version: z.string().optional(),
  idempotency_key: z.string().min(8),
});

export const createGuestReservationFn = createServerFn({ method: "POST" })
  .validator((d) => guestReservationSchema.parse(d))
  .handler(async ({ data }) => createGuestReservation(data));

/** Create a Stripe Checkout Session for a reservation's balance (by access token). */
const checkoutSchema = z.object({
  reservation_id: z.string(),
  guest_email: z.string().optional(),
  origin: z.string(),
  access_token: z.string().optional(),
});

export const createCheckoutFn = createServerFn({ method: "POST" })
  .validator((d) => checkoutSchema.parse(d))
  .handler(async ({ data }) => {
    // Require either a valid access capability for this reservation, or the
    // reservation was just created by this caller (access token provided).
    if (data.access_token) {
      const cap = await resolveAccessCapability(data.access_token);
      if (!cap || cap.reservation_id !== data.reservation_id) {
        throw new Error("Unauthorized: invalid or expired access link.");
      }
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    return createCheckout(supabaseAdmin, {
      reservation_id: data.reservation_id,
      ...(data.guest_email !== undefined ? { guest_email: data.guest_email } : {}),
      origin: data.origin,
    });
  });

/** Get authoritative reservation + payment status (by access token OR staff auth). */
const statusSchema = z.object({
  reservation_id: z.string(),
  access_token: z.string().optional(),
});

export const getReservationStatusFn = createServerFn({ method: "GET" })
  .validator((d) => statusSchema.parse(d))
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) => {
    // Require either a valid access capability for this reservation, or staff auth.
    if (data.access_token) {
      const cap = await resolveAccessCapability(data.access_token);
      if (!cap || cap.reservation_id !== data.reservation_id) {
        throw new Error("Unauthorized: invalid or expired access link.");
      }
    } else {
      // No access token — require staff authorization.
      const { data: isStaff } = await context.supabase.rpc("is_staff", {
        _user_id: context.userId,
      });
      if (!isStaff) {
        throw new Error("Unauthorized: access token or staff role required.");
      }
    }
    return getReservationStatus(context.supabase, data.reservation_id);
  });

/** Public: resolve an access token to a reservation ID (for the /reservation page). */
export const resolveAccessFn = createServerFn({ method: "GET" })
  .validator((d) => z.object({ access_token: z.string() }).parse(d))
  .handler(async ({ data }) => resolveAccessCapability(data.access_token));

/** Public: guest cancellation (by access token). */
const guestCancelSchema = z.object({
  reservation_id: z.string(),
  access_token: z.string(),
});

export const guestCancelReservationFn = createServerFn({ method: "POST" })
  .validator((d) => guestCancelSchema.parse(d))
  .handler(async ({ data }) => {
    const cap = await resolveAccessCapability(data.access_token);
    if (!cap || cap.reservation_id !== data.reservation_id) {
      throw new Error("Unauthorized: invalid or expired access link.");
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    return guestCancelReservation(supabaseAdmin, data.reservation_id);
  });

/** Staff: issue a refund (manager-only). */
const refundSchema = z.object({
  reservation_id: z.string(),
  amount_cents: z.number().int().min(0).optional(),
  reason: z.string().optional(),
});

export const staffRefundFn = createServerFn({ method: "POST" })
  .validator((d) => refundSchema.parse(d))
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) => staffRefund(context.supabase, context.userId, data));

/** Public: Stripe configuration status (for the booking UI to show honest states). */
export const getStripeConfigStatusFn = createServerFn({ method: "GET" }).handler(async () => {
  const status = getStripeConfig();
  return { configured: status.configured };
});

export type { CheckoutResult, ReservationStatusView };
