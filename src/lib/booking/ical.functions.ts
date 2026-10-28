import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import {
  listIcalUnits,
  updateIcalMapping,
  regenerateExportToken,
  syncUnitIcal,
  runScheduledSync,
  checkIcalFreshness,
  getSyncHistory,
  getSyncSettings,
  updateSyncSettings,
  type IcalUnit,
  type IcalMappingInput,
  type ImportOutcome,
} from "./ical.server";

export const listIcalUnitsFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => listIcalUnits(context.supabase));

const mappingSchema = z.object({
  unit_id: z.string(),
  airbnb_listing_id: z.string().nullable().optional(),
  airbnb_url: z.string().nullable().optional(),
  ical_import_url: z.string().nullable().optional(),
  ical_sync_enabled: z.boolean().nullable().optional(),
});

export const updateIcalMappingFn = createServerFn({ method: "POST" })
  .validator((d) => mappingSchema.parse(d))
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) => updateIcalMapping(context.supabase, data as IcalMappingInput));

export const regenerateExportTokenFn = createServerFn({ method: "POST" })
  .validator((d) => z.object({ unit_id: z.string() }).parse(d))
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) => regenerateExportToken(context.supabase, data.unit_id));

export const syncUnitIcalFn = createServerFn({ method: "POST" })
  .validator((d) => z.object({ unit_id: z.string(), feed_url: z.string().url() }).parse(d))
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) => syncUnitIcal(context.supabase, data.unit_id, data.feed_url));

export const runScheduledSyncFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async () => runScheduledSync());

export const checkIcalFreshnessFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async () => checkIcalFreshness());

export const getSyncHistoryFn = createServerFn({ method: "GET" })
  .validator((d) => z.object({ unit_id: z.string() }).parse(d))
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) => getSyncHistory(context.supabase, data.unit_id));

export const getSyncSettingsFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => getSyncSettings(context.supabase));

const settingsSchema = z.object({
  ical_sync_enabled: z.boolean().optional(),
  ical_sync_interval_minutes: z.number().int().min(1).max(1440).optional(),
  ical_export_base_url: z.string().nullable().optional(),
  ical_stale_after_hours: z.number().int().min(1).max(168).optional(),
});

export const updateSyncSettingsFn = createServerFn({ method: "POST" })
  .validator((d) => settingsSchema.parse(d))
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) => updateSyncSettings(context.supabase, data));

export type { IcalUnit, IcalMappingInput, ImportOutcome };
