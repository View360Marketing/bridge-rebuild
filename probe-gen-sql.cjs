const fs = require("fs");
const data = JSON.parse(fs.readFileSync("/tmp/hostaway-data.json", "utf8"));

function sqlStr(s) {
  if (s === null || s === undefined) return "NULL";
  return "'" + String(s).replace(/'/g, "''") + "'";
}

const unitsSQL = [];

data.forEach(d => {
  const ucode = d.suggested_new_unit_code;
  const name = d.public_name;
  const desc = d.description;
  const kind = d.recommended_unit_kind;
  const mg = d.max_guests || 0;
  const ma = d.max_adults || 0;
  const mc = d.max_children || 0;
  const br = d.bedrooms || 0;
  const beds = d.beds || 0;
  const bath = d.bathrooms || 0;
  const rate = d.source_base_rate_cents || 0;
  const cur = d.currency || "USD";
  const url = d.source_url;
  const rk = d.record_kind;
  const reviewRequired = d.record_kind === "rv_package_offer" || !!d.review_notes;
  const mediaExpected = (d.media || []).length;

  unitsSQL.push(
`INSERT INTO public.units (
  id, unit_code, name, description, unit_kind, max_guests, max_adults, max_children,
  bedrooms, beds, bathrooms, base_rate_cents, currency, property_id, room_type_id,
  is_published, is_closed, hostaway_listing_id, hostaway_source_url, hostaway_record_kind,
  hostaway_review_required, hostaway_media_expected, hostaway_media_copied, created_at, updated_at
) VALUES (
  gen_random_uuid(), ${sqlStr(ucode)}, ${sqlStr(name)}, ${sqlStr(desc)}, ${sqlStr(kind)},
  ${mg}, ${ma}, ${mc}, ${br}, ${beds}, ${bath}, ${rate}, ${sqlStr(cur)},
  (SELECT id FROM public.properties LIMIT 1), NULL,
  false, true, ${sqlStr(d.hostaway_listing_id)}, ${sqlStr(url)}, ${sqlStr(rk)},
  ${reviewRequired}, ${mediaExpected}, 0, now(), now()
) ON CONFLICT (hostaway_listing_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  unit_kind = EXCLUDED.unit_kind,
  max_guests = EXCLUDED.max_guests,
  max_adults = EXCLUDED.max_adults,
  max_children = EXCLUDED.max_children,
  bedrooms = EXCLUDED.bedrooms,
  beds = EXCLUDED.beds,
  bathrooms = EXCLUDED.bathrooms,
  base_rate_cents = EXCLUDED.base_rate_cents,
  currency = EXCLUDED.currency,
  hostaway_source_url = EXCLUDED.hostaway_source_url,
  hostaway_record_kind = EXCLUDED.hostaway_record_kind,
  hostaway_review_required = EXCLUDED.hostaway_review_required,
  hostaway_media_expected = EXCLUDED.hostaway_media_expected,
  updated_at = now();`
  );
});

fs.writeFileSync("probe-hostaway-units.sql", unitsSQL.join("\n\n"));
console.log("Units SQL:", unitsSQL.length, "statements,", (unitsSQL.join("\n\n").length / 1024).toFixed(1), "KB");

const catalogSQL = [];
data.forEach(d => {
  const lid = d.hostaway_listing_id;
  const source = JSON.stringify({
    name: d.source_name,
    public_name: d.public_name,
    description: d.description,
    property_type: d.source_property_type,
    kind: d.record_kind,
    max_guests: d.max_guests,
    max_adults: d.max_adults,
    max_children: d.max_children,
    bedrooms: d.bedrooms,
    beds: d.beds,
    bathrooms: d.bathrooms,
    base_rate_cents: d.source_base_rate_cents,
    currency: d.currency,
    house_rules: d.house_rules,
    amenities: d.amenities,
    bookable: d.source_booking_website_bookable,
    shared_inventory_group: d.shared_inventory_group,
    review_notes: d.review_notes,
    sort_order: d.sort_order
  }).replace(/'/g, "''");

  catalogSQL.push(
`INSERT INTO public.hostaway_catalog (listing_id, unit_id, source, imported_at)
SELECT ${sqlStr(lid)}, u.id, '${source}'::jsonb, now()
FROM public.units u WHERE u.hostaway_listing_id = ${sqlStr(lid)}
ON CONFLICT (listing_id) DO UPDATE SET
  unit_id = EXCLUDED.unit_id,
  source = EXCLUDED.source,
  imported_at = now();`
  );
});

fs.writeFileSync("probe-hostaway-catalog.sql", catalogSQL.join("\n\n"));
console.log("Catalog SQL:", catalogSQL.length, "statements,", (catalogSQL.join("\n\n").length / 1024).toFixed(1), "KB");