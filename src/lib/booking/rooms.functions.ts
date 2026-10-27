import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import {
  listProperties,
  listRoomTypes,
  listUnits,
  listUnitMedia,
  upsertUnit,
  updateUnit,
  archiveUnit,
  addUnitMedia,
  updateUnitMediaOrder,
  deleteUnitMedia,
  validateCsvImport,
  confirmCsvImport,
  getInventoryAuthority,
  type UnitInput,
} from "./rooms.server";

export const listPropertiesFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => listProperties(context.supabase));

export const listRoomTypesFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => listRoomTypes(context.supabase));

export const listUnitsFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => listUnits(context.supabase));

/** Public: list published, non-archived units for the /stay page. No auth. */
export const listPublishedUnitsFn = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("units")
    .select("*")
    .eq("is_published", true)
    .eq("is_archived", false)
    .order("sort_order, unit_code");
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as import("./rooms.server").UnitRow[];
});

export const listUnitMediaFn = createServerFn({ method: "GET" })
  .validator((d) => z.object({ unitId: z.string() }).parse(d))
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) => listUnitMedia(context.supabase, data.unitId));

const unitInputSchema = z.object({
  unit_code: z.string().min(1),
  public_name: z.string().optional(),
  property_id: z.string().optional(),
  room_type_id: z.string().optional(),
  unit_kind: z.enum(["room", "cabin", "rv_site", "suite"]).optional(),
  description: z.string().optional(),
  max_guests: z.number().int().min(0).optional(),
  max_adults: z.number().int().min(0).optional(),
  max_children: z.number().int().min(0).optional(),
  bedrooms: z.number().int().min(0).optional(),
  beds: z.number().int().min(0).optional(),
  bathrooms: z.number().int().min(0).optional(),
  pet_policy: z.enum(["no_pets", "pets_allowed", "pets_negotiable"]).optional(),
  accessibility_notes: z.string().optional(),
  base_rate_cents: z.number().int().min(0).optional(),
  cleaning_fee_cents: z.number().int().min(0).optional(),
  is_published: z.boolean().optional(),
  is_closed: z.boolean().optional(),
  sort_order: z.number().int().optional(),
});

export const upsertUnitFn = createServerFn({ method: "POST" })
  .validator((d) => unitInputSchema.parse(d))
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) => upsertUnit(context.supabase, data as UnitInput));

export const updateUnitFn = createServerFn({ method: "POST" })
  .validator((d) => z.object({ id: z.string(), patch: unitInputSchema.partial() }).parse(d))
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) =>
    updateUnit(context.supabase, data.id, data.patch as Partial<UnitInput>),
  );

export const archiveUnitFn = createServerFn({ method: "POST" })
  .validator((d) => z.object({ id: z.string() }).parse(d))
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) => archiveUnit(context.supabase, data.id));

export const addUnitMediaFn = createServerFn({ method: "POST" })
  .validator((d) =>
    z
      .object({
        unitId: z.string(),
        image_url: z.string(),
        alt_text: z.string().optional(),
        caption: z.string().optional(),
        storage_path: z.string().optional(),
        is_primary: z.boolean().optional(),
      })
      .parse(d),
  )
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) => addUnitMedia(context.supabase, data.unitId, data));

export const updateUnitMediaOrderFn = createServerFn({ method: "POST" })
  .validator((d) => z.object({ orderedIds: z.array(z.string()) }).parse(d))
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) => updateUnitMediaOrder(context.supabase, data.orderedIds));

export const deleteUnitMediaFn = createServerFn({ method: "POST" })
  .validator((d) => z.object({ mediaId: z.string() }).parse(d))
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) => deleteUnitMedia(context.supabase, data.mediaId));

export const validateCsvImportFn = createServerFn({ method: "POST" })
  .validator((d) => z.object({ csv: z.string() }).parse(d))
  .middleware([requireSupabaseAuth])
  .handler(async ({ data }) => validateCsvImport(data.csv));

export const confirmCsvImportFn = createServerFn({ method: "POST" })
  .validator((d) => z.object({ csv: z.string() }).parse(d))
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) => confirmCsvImport(context.supabase, data.csv));

export const getInventoryAuthorityFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => getInventoryAuthority(context.supabase));
