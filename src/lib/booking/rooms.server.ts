import type { SupabaseClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export type PropertyRow = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  timezone: string;
  currency: string;
  contact_phone: string | null;
  contact_email: string | null;
  is_archived: boolean;
};

export type RoomTypeRow = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  default_max_guests: number;
  amenities: string[];
  is_archived: boolean;
};

export type UnitRow = {
  id: string;
  unit_code: string;
  public_name: string | null;
  property_id: string | null;
  room_type_id: string | null;
  unit_kind: string;
  description: string | null;
  max_guests: number;
  max_adults: number;
  max_children: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  pet_policy: string;
  accessibility_notes: string | null;
  base_rate_cents: number;
  cleaning_fee_cents: number;
  is_published: boolean;
  is_archived: boolean;
  is_closed: boolean;
  sort_order: number;
};

export type UnitMediaRow = {
  id: string;
  unit_id: string;
  image_url: string;
  alt_text: string | null;
  caption: string | null;
  sort_order: number;
  is_primary: boolean;
  storage_path: string | null;
};

export type UnitInput = {
  unit_code: string;
  public_name?: string | undefined;
  property_id?: string | undefined;
  room_type_id?: string | undefined;
  unit_kind?: string | undefined;
  description?: string | undefined;
  max_guests?: number | undefined;
  max_adults?: number | undefined;
  max_children?: number | undefined;
  bedrooms?: number | undefined;
  beds?: number | undefined;
  bathrooms?: number | undefined;
  pet_policy?: string | undefined;
  accessibility_notes?: string | undefined;
  base_rate_cents?: number | undefined;
  cleaning_fee_cents?: number | undefined;
  is_published?: boolean | undefined;
  is_closed?: boolean | undefined;
  sort_order?: number | undefined;
};

export type MediaInput = {
  image_url: string;
  alt_text?: string | undefined;
  caption?: string | undefined;
  storage_path?: string | undefined;
  is_primary?: boolean | undefined;
};

export async function listProperties(supabase: SupabaseClient): Promise<PropertyRow[]> {
  const { data, error } = await supabase.from("properties").select("*").order("name");
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as PropertyRow[];
}

export async function listRoomTypes(supabase: SupabaseClient): Promise<RoomTypeRow[]> {
  const { data, error } = await supabase.from("room_types").select("*").order("name");
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as RoomTypeRow[];
}

export async function listUnits(supabase: SupabaseClient): Promise<UnitRow[]> {
  const { data, error } = await supabase.from("units").select("*").order("sort_order, unit_code");
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as UnitRow[];
}

export async function listUnitMedia(
  supabase: SupabaseClient,
  unitId: string,
): Promise<UnitMediaRow[]> {
  const { data, error } = await supabase
    .from("unit_media")
    .select("*")
    .eq("unit_id", unitId)
    .order("sort_order, created_at");
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as UnitMediaRow[];
}

export async function upsertUnit(supabase: SupabaseClient, input: UnitInput): Promise<UnitRow> {
  const { data, error } = await supabase
    .from("units")
    .insert({
      unit_code: input.unit_code,
      public_name: input.public_name ?? null,
      property_id: input.property_id ?? null,
      room_type_id: input.room_type_id ?? null,
      unit_kind: input.unit_kind ?? "room",
      description: input.description ?? null,
      max_guests: input.max_guests ?? 2,
      max_adults: input.max_adults ?? 2,
      max_children: input.max_children ?? 0,
      bedrooms: input.bedrooms ?? 1,
      beds: input.beds ?? 1,
      bathrooms: input.bathrooms ?? 1,
      pet_policy: input.pet_policy ?? "no_pets",
      accessibility_notes: input.accessibility_notes ?? null,
      base_rate_cents: input.base_rate_cents ?? 0,
      cleaning_fee_cents: input.cleaning_fee_cents ?? 0,
      is_published: input.is_published ?? false,
      is_archived: false,
      is_closed: input.is_closed ?? false,
      sort_order: input.sort_order ?? 0,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as unknown as UnitRow;
}

export async function updateUnit(
  supabase: SupabaseClient,
  id: string,
  patch: Partial<UnitInput>,
): Promise<UnitRow> {
  const { data, error } = await supabase
    .from("units")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as unknown as UnitRow;
}

export async function archiveUnit(supabase: SupabaseClient, id: string): Promise<UnitRow> {
  const { data, error } = await supabase
    .from("units")
    .update({ is_archived: true, is_published: false, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as unknown as UnitRow;
}

export async function addUnitMedia(
  supabase: SupabaseClient,
  unitId: string,
  media: MediaInput,
): Promise<UnitMediaRow> {
  const { data, error } = await supabase
    .from("unit_media")
    .insert({
      unit_id: unitId,
      image_url: media.image_url,
      alt_text: media.alt_text ?? null,
      caption: media.caption ?? null,
      storage_path: media.storage_path ?? null,
      is_primary: media.is_primary ?? false,
      sort_order: 0,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as unknown as UnitMediaRow;
}

export async function updateUnitMediaOrder(
  supabase: SupabaseClient,
  orderedIds: string[],
): Promise<void> {
  const updates = orderedIds.map((id, i) =>
    supabase.from("unit_media").update({ sort_order: i }).eq("id", id),
  );
  const results = await Promise.all(updates);
  const failed = results.find((r) => r.error);
  if (failed?.error) throw new Error(failed.error.message);
}

export async function deleteUnitMedia(supabase: SupabaseClient, mediaId: string): Promise<void> {
  const { error } = await supabase.from("unit_media").delete().eq("id", mediaId);
  if (error) throw new Error(error.message);
}

export type CsvRow = Record<string, string>;
export type CsvValidation = {
  valid: boolean;
  errors: string[];
  row: CsvRow;
  parsed?: UnitInput;
};

const UNIT_KINDS = ["room", "cabin", "rv_site", "suite"];
const PET_POLICIES = ["no_pets", "pets_allowed", "pets_negotiable"];

export const CSV_COLUMNS = [
  "unit_code",
  "public_name",
  "property_code",
  "room_type_code",
  "unit_kind",
  "description",
  "max_guests",
  "max_adults",
  "max_children",
  "bedrooms",
  "beds",
  "bathrooms",
  "pet_policy",
  "accessibility_notes",
  "base_rate_cents",
  "cleaning_fee_cents",
  "image_urls",
  "published",
];

function get(row: CsvRow, key: string): string {
  return row[key] ?? "";
}

function parseCsv(text: string): CsvRow[] {
  const rows: CsvRow[] = [];
  const lines = text
    .replace(/\r\n/g, "\n")
    .split("\n")
    .filter((l) => l.trim().length);
  if (lines.length < 2) return rows;
  const headerLine = lines[0];
  if (!headerLine) return rows;
  const headers = headerLine.split(",").map((h) => h.trim());
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;
    const values = line.split(",").map((v) => v.trim());
    const row: CsvRow = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] ?? "";
    });
    rows.push(row);
  }
  return rows;
}

export function validateCsvRows(rows: CsvRow[]): CsvValidation[] {
  return rows.map((row, idx) => {
    const errors: string[] = [];
    const code = get(row, "unit_code");
    if (!code) errors.push(`Row ${idx + 1}: unit_code is required`);
    const kind = get(row, "unit_kind");
    if (kind && !UNIT_KINDS.includes(kind))
      errors.push(`Row ${idx + 1}: unit_kind must be one of ${UNIT_KINDS.join(", ")}`);
    const pet = get(row, "pet_policy");
    if (pet && !PET_POLICIES.includes(pet))
      errors.push(`Row ${idx + 1}: pet_policy must be one of ${PET_POLICIES.join(", ")}`);
    const numFields = [
      "max_guests",
      "max_adults",
      "max_children",
      "bedrooms",
      "beds",
      "bathrooms",
      "base_rate_cents",
      "cleaning_fee_cents",
    ];
    for (const f of numFields) {
      const v = get(row, f);
      if (v !== "" && Number.isNaN(Number(v))) errors.push(`Row ${idx + 1}: ${f} must be a number`);
    }
    if (errors.length) return { valid: false, errors, row };
    const published = get(row, "published");
    const parsed: UnitInput = {
      unit_code: code,
      public_name: get(row, "public_name") || undefined,
      unit_kind: get(row, "unit_kind") || "room",
      description: get(row, "description") || undefined,
      max_guests: get(row, "max_guests") ? Number(get(row, "max_guests")) : 2,
      max_adults: get(row, "max_adults") ? Number(get(row, "max_adults")) : 2,
      max_children: get(row, "max_children") ? Number(get(row, "max_children")) : 0,
      bedrooms: get(row, "bedrooms") ? Number(get(row, "bedrooms")) : 1,
      beds: get(row, "beds") ? Number(get(row, "beds")) : 1,
      bathrooms: get(row, "bathrooms") ? Number(get(row, "bathrooms")) : 1,
      pet_policy: get(row, "pet_policy") || "no_pets",
      accessibility_notes: get(row, "accessibility_notes") || undefined,
      base_rate_cents: get(row, "base_rate_cents") ? Number(get(row, "base_rate_cents")) : 0,
      cleaning_fee_cents: get(row, "cleaning_fee_cents")
        ? Number(get(row, "cleaning_fee_cents"))
        : 0,
      is_published: published === "true" || published === "1",
    };
    return { valid: true, errors: [], row, parsed };
  });
}

export async function validateCsvImport(text: string): Promise<{
  total: number;
  valid: number;
  invalid: number;
  rows: CsvValidation[];
}> {
  const rows = parseCsv(text);
  const validated = validateCsvRows(rows);
  return {
    total: validated.length,
    valid: validated.filter((v) => v.valid).length,
    invalid: validated.filter((v) => !v.valid).length,
    rows: validated,
  };
}

export async function confirmCsvImport(
  supabase: SupabaseClient,
  text: string,
): Promise<{ inserted: number; skipped: number; errors: string[] }> {
  const validated = validateCsvRows(parseCsv(text));
  const errors: string[] = [];
  let inserted = 0;
  let skipped = 0;
  for (const v of validated) {
    if (!v.valid || !v.parsed) {
      skipped++;
      continue;
    }
    try {
      await upsertUnit(supabase, v.parsed);
      inserted++;
    } catch (e) {
      errors.push(`${get(v.row, "unit_code")}: ${(e as Error).message}`);
    }
  }
  return { inserted, skipped, errors };
}

export async function getInventoryAuthority(
  supabase: SupabaseClient,
): Promise<{ authority: string; expected: number; instantBooking: boolean }> {
  const { data } = await supabase
    .from("integration_settings")
    .select("inventory_authority, expected_room_count, instant_booking_enabled")
    .eq("id", 1)
    .single();
  return {
    authority: data?.inventory_authority ?? "UNRESOLVED",
    expected: data?.expected_room_count ?? 33,
    instantBooking: data?.instant_booking_enabled ?? false,
  };
}

void supabaseAdmin;
