import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import {
  getOperationsStats,
  getArrivals,
  getDepartures,
  type OperationsStats,
  type ArrivalRow,
  type DepartureRow,
} from "./operations.server";
import {
  recordManualPayment,
  reverseManualPayment,
  listManualPayments,
  type ManualPaymentInput,
} from "./payments-ledger.server";
import {
  listRatePlans,
  upsertRatePlan,
  listDateOverrides,
  addDateOverride,
  listRestrictions,
  addRestriction,
  listFees,
  listTaxes,
  listPromotions,
  listPolicies,
  type RatePlanInput,
  type DateOverrideInput,
  type RestrictionInput,
} from "./rates.server";
import {
  listGuests,
  getGuest,
  findDuplicateGuests,
  mergeGuests,
  exportGuestsCsv,
} from "./guests.server";
import {
  listStaffUsers,
  createStaffUser,
  assignRole,
  removeRole,
  disableUser,
  enableUser,
  resetPassword,
  type StaffUser,
} from "./users.server";
import {
  listHousekeepingTasks,
  listUnitCleanliness,
  createTurnoverTask,
  updateTaskStatus,
  assignTask,
  setUnitCleanliness,
  createMaintenanceBlock,
  listMaintenanceBlocks,
  releaseMaintenanceBlock,
  type HousekeepingTask,
  type UnitCleanliness,
} from "./housekeeping.server";
import {
  getOccupancyReport,
  getFinancialReport,
  getSourceReport,
  getArrivalsDeparturesReport,
  type ReportRange,
} from "./reports.server";

// ── Operations dashboard ──────────────────────────────────────────────────

export const getOperationsStatsFn = createServerFn({ method: "GET" })
  .validator((d) => z.object({ date: z.string().optional() }).parse(d))
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) => getOperationsStats(context.supabase, data.date));

export const getArrivalsFn = createServerFn({ method: "GET" })
  .validator((d) => z.object({ date: z.string().optional() }).parse(d))
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) => getArrivals(context.supabase, data.date));

export const getDeparturesFn = createServerFn({ method: "GET" })
  .validator((d) => z.object({ date: z.string().optional() }).parse(d))
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) => getDepartures(context.supabase, data.date));

// ── Manual payments ledger ────────────────────────────────────────────────

const manualPaymentSchema = z.object({
  reservation_id: z.string(),
  amount_cents: z.number().int().positive(),
  method: z.enum(["cash", "check", "external_card", "other"]),
  reference: z.string().optional(),
  collected_at: z.string().optional(),
  notes: z.string().optional(),
});

export const recordManualPaymentFn = createServerFn({ method: "POST" })
  .validator((d) => manualPaymentSchema.parse(d))
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) =>
    recordManualPayment(context.supabase, context.userId, data as ManualPaymentInput),
  );

export const reverseManualPaymentFn = createServerFn({ method: "POST" })
  .validator((d) => z.object({ payment_id: z.string(), reason: z.string().optional() }).parse(d))
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) =>
    reverseManualPayment(context.supabase, context.userId, data.payment_id, data.reason),
  );

export const listManualPaymentsFn = createServerFn({ method: "GET" })
  .validator((d) => z.object({ reservation_id: z.string() }).parse(d))
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) => listManualPayments(context.supabase, data.reservation_id));

// ── Rates & rules ─────────────────────────────────────────────────────────

export const listRatePlansFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => listRatePlans(context.supabase));

const ratePlanSchema = z.object({
  code: z.string(),
  name: z.string(),
  room_type_id: z.string().optional(),
  unit_id: z.string().optional(),
  base_nightly_cents: z.number().int().min(0),
  weekend_nightly_cents: z.number().int().min(0).optional(),
  additional_adult_cents: z.number().int().min(0).optional(),
  additional_child_cents: z.number().int().min(0).optional(),
  weekend_days: z.array(z.number()).optional(),
  is_active: z.boolean().optional(),
  effective_from: z.string().optional(),
  effective_to: z.string().optional(),
});

export const upsertRatePlanFn = createServerFn({ method: "POST" })
  .validator((d) => ratePlanSchema.parse(d))
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) =>
    upsertRatePlan(context.supabase, context.userId, data as RatePlanInput),
  );

export const listDateOverridesFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => listDateOverrides(context.supabase));

const dateOverrideSchema = z.object({
  unit_id: z.string().optional(),
  rate_plan_id: z.string().optional(),
  stay_date: z.string(),
  nightly_cents: z.number().int().min(0),
  reason: z.string().optional(),
});

export const addDateOverrideFn = createServerFn({ method: "POST" })
  .validator((d) => dateOverrideSchema.parse(d))
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) =>
    addDateOverride(context.supabase, context.userId, data as DateOverrideInput),
  );

export const listRestrictionsFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => listRestrictions(context.supabase));

const restrictionSchema = z.object({
  unit_id: z.string().optional(),
  room_type_id: z.string().optional(),
  stay_date: z.string(),
  min_stay: z.number().int().min(1).optional(),
  max_stay: z.number().int().min(1).optional(),
  closed_to_arrival: z.boolean().optional(),
  closed_to_departure: z.boolean().optional(),
  is_closed: z.boolean().optional(),
});

export const addRestrictionFn = createServerFn({ method: "POST" })
  .validator((d) => restrictionSchema.parse(d))
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) =>
    addRestriction(context.supabase, context.userId, data as RestrictionInput),
  );

export const listFeesFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => listFees(context.supabase));

export const listTaxesFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => listTaxes(context.supabase));

export const listPromotionsFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => listPromotions(context.supabase));

export const listPoliciesFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => listPolicies(context.supabase));

// ── Guests ─────────────────────────────────────────────────────────────────

export const listGuestsFn = createServerFn({ method: "GET" })
  .validator((d) => z.object({ search: z.string().optional() }).optional().default({}).parse(d))
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) => listGuests(context.supabase, data?.search));

export const getGuestFn = createServerFn({ method: "GET" })
  .validator((d) => z.object({ guest_id: z.string() }).parse(d))
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) => getGuest(context.supabase, data.guest_id));

export const findDuplicateGuestsFn = createServerFn({ method: "GET" })
  .validator((d) => z.object({ guest_id: z.string() }).parse(d))
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) => findDuplicateGuests(context.supabase, data.guest_id));

export const mergeGuestsFn = createServerFn({ method: "POST" })
  .validator((d) => z.object({ source_id: z.string(), target_id: z.string() }).parse(d))
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) =>
    mergeGuests(context.supabase, context.userId, data.source_id, data.target_id),
  );

export const exportGuestsCsvFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => exportGuestsCsv(context.supabase));

// ── Users ──────────────────────────────────────────────────────────────────

export const listStaffUsersFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => listStaffUsers(context.supabase));

const createStaffSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["manager", "front_desk", "housekeeping", "read_only"]),
  send_invite: z.boolean().optional(),
});

export const createStaffUserFn = createServerFn({ method: "POST" })
  .validator((d) => createStaffSchema.parse(d))
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) =>
    createStaffUser(context.supabase, context.userId, {
      email: data.email,
      password: data.password,
      role: data.role,
      sendInvite: data.send_invite ?? false,
    }),
  );

export const assignRoleFn = createServerFn({ method: "POST" })
  .validator((d) =>
    z
      .object({
        target_user_id: z.string(),
        role: z.enum(["super_admin", "manager", "front_desk", "housekeeping", "read_only"]),
      })
      .parse(d),
  )
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) =>
    assignRole(context.supabase, context.userId, data.target_user_id, data.role),
  );

export const removeRoleFn = createServerFn({ method: "POST" })
  .validator((d) =>
    z
      .object({
        target_user_id: z.string(),
        role: z.enum(["super_admin", "manager", "front_desk", "housekeeping", "read_only"]),
      })
      .parse(d),
  )
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) =>
    removeRole(context.supabase, context.userId, data.target_user_id, data.role),
  );

export const disableUserFn = createServerFn({ method: "POST" })
  .validator((d) => z.object({ target_user_id: z.string() }).parse(d))
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) =>
    disableUser(context.supabase, context.userId, data.target_user_id),
  );

export const enableUserFn = createServerFn({ method: "POST" })
  .validator((d) => z.object({ target_user_id: z.string() }).parse(d))
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) =>
    enableUser(context.supabase, context.userId, data.target_user_id),
  );

export const resetPasswordFn = createServerFn({ method: "POST" })
  .validator((d) => z.object({ target_user_id: z.string() }).parse(d))
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) =>
    resetPassword(context.supabase, context.userId, data.target_user_id),
  );

// ── Housekeeping & maintenance ─────────────────────────────────────────────

export const listHousekeepingTasksFn = createServerFn({ method: "GET" })
  .validator((d) => z.object({ date: z.string().optional() }).parse(d))
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) => listHousekeepingTasks(context.supabase, data.date));

export const listUnitCleanlinessFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => listUnitCleanliness(context.supabase));

const turnoverSchema = z.object({
  unit_id: z.string(),
  reservation_id: z.string(),
  task_date: z.string(),
  same_day_arrival: z.boolean(),
});

export const createTurnoverTaskFn = createServerFn({ method: "POST" })
  .validator((d) => turnoverSchema.parse(d))
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) => createTurnoverTask(context.supabase, context.userId, data));

const taskStatusSchema = z.object({
  task_id: z.string(),
  status: z.enum(["pending", "in_progress", "inspected", "complete"]),
});

export const updateTaskStatusFn = createServerFn({ method: "POST" })
  .validator((d) => taskStatusSchema.parse(d))
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) =>
    updateTaskStatus(context.supabase, context.userId, data.task_id, data.status),
  );

export const assignTaskFn = createServerFn({ method: "POST" })
  .validator((d) => z.object({ task_id: z.string(), assigned_to: z.string() }).parse(d))
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) =>
    assignTask(context.supabase, context.userId, data.task_id, data.assigned_to),
  );

const cleanlinessSchema = z.object({
  unit_id: z.string(),
  state: z.enum(["clean", "dirty", "cleaning", "inspected", "out_of_service"]),
});

export const setUnitCleanlinessFn = createServerFn({ method: "POST" })
  .validator((d) => cleanlinessSchema.parse(d))
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) =>
    setUnitCleanliness(context.supabase, context.userId, data.unit_id, data.state),
  );

const maintenanceBlockSchema = z.object({
  unit_id: z.string(),
  checkin_date: z.string(),
  checkout_date: z.string(),
  reason: z.string().min(1),
});

export const createMaintenanceBlockFn = createServerFn({ method: "POST" })
  .validator((d) => maintenanceBlockSchema.parse(d))
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) =>
    createMaintenanceBlock(context.supabase, context.userId, data),
  );

export const listMaintenanceBlocksFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => listMaintenanceBlocks(context.supabase));

export const releaseMaintenanceBlockFn = createServerFn({ method: "POST" })
  .validator((d) => z.object({ block_id: z.string() }).parse(d))
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) =>
    releaseMaintenanceBlock(context.supabase, context.userId, data.block_id),
  );

// ── Reports ────────────────────────────────────────────────────────────────

const reportRangeSchema = z.object({
  from: z.string(),
  to: z.string(),
});

export const getOccupancyReportFn = createServerFn({ method: "GET" })
  .validator((d) => reportRangeSchema.parse(d))
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) => getOccupancyReport(context.supabase, data as ReportRange));

export const getFinancialReportFn = createServerFn({ method: "GET" })
  .validator((d) => reportRangeSchema.parse(d))
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) => getFinancialReport(context.supabase, data as ReportRange));

export const getSourceReportFn = createServerFn({ method: "GET" })
  .validator((d) => reportRangeSchema.parse(d))
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) => getSourceReport(context.supabase, data as ReportRange));

export const getArrivalsDeparturesReportFn = createServerFn({ method: "GET" })
  .validator((d) => reportRangeSchema.parse(d))
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) =>
    getArrivalsDeparturesReport(context.supabase, data as ReportRange),
  );

// Re-export types for route components
export type {
  OperationsStats,
  ArrivalRow,
  DepartureRow,
  StaffUser,
  HousekeepingTask,
  UnitCleanliness,
};
