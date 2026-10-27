-- Seed the property, a default room type, and all 33 physical rooms (1-33).
-- Rooms are created as drafts (is_published = false) so specifics can be
-- adjusted in the admin before they appear on the public /stay page.

-- 1. Property -----------------------------------------------------------------
INSERT INTO public.properties (code, name, description, timezone, currency, contact_phone, contact_email)
VALUES (
  'BRIDGES',
  'The Bridges',
  'The Bridges — a natural-bridge resort in Waynesboro, Tennessee offering overnight lodging, private events, and wellness experiences.',
  'America/Chicago',
  'USD',
  '931-722-5589',
  'stay@thebridgestn.com'
)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  timezone = EXCLUDED.timezone,
  currency = EXCLUDED.currency,
  contact_phone = EXCLUDED.contact_phone,
  contact_email = EXCLUDED.contact_email,
  updated_at = now();

-- 2. Room type ----------------------------------------------------------------
INSERT INTO public.room_types (code, name, description, default_max_guests, amenities)
VALUES (
  'STANDARD',
  'Standard Room',
  'Standard overnight guest room at The Bridges.',
  2,
  '["Wi-Fi","Air conditioning","Linens provided"]'::jsonb
)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  default_max_guests = EXCLUDED.default_max_guests,
  amenities = EXCLUDED.amenities,
  updated_at = now();

-- 3. Units 1-33 ---------------------------------------------------------------
-- Uses a DO block to insert 33 rows with deterministic unit codes and names.
DO $$
DECLARE
  i int;
  v_property_id uuid := (SELECT id FROM public.properties WHERE code = 'BRIDGES');
  v_room_type_id uuid := (SELECT id FROM public.room_types WHERE code = 'STANDARD');
BEGIN
  FOR i IN 1..33 LOOP
    INSERT INTO public.units (
      unit_code, public_name, property_id, room_type_id, unit_kind,
      description, max_guests, max_adults, max_children,
      bedrooms, beds, bathrooms, pet_policy,
      base_rate_cents, cleaning_fee_cents,
      is_published, is_archived, is_closed, sort_order
    ) VALUES (
      'ROOM-' || lpad(i::text, 2, '0'),
      'Room ' || i,
      v_property_id,
      v_room_type_id,
      'room',
      'Guest room at The Bridges. Adjust capacity, amenities, rate, and photos in the admin.',
      2, 2, 0,
      1, 1, 1, 'no_pets',
      9900, 0,
      false, false, false, i
    )
    ON CONFLICT (unit_code) DO UPDATE SET
      public_name = EXCLUDED.public_name,
      property_id = EXCLUDED.property_id,
      room_type_id = EXCLUDED.room_type_id,
      sort_order = EXCLUDED.sort_order,
      updated_at = now();
  END LOOP;
END $$;

-- 4. Default rate plan for the standard room type -----------------------------
-- Base weekday $99 / weekend $134, matching the active winter seasonal offer.
INSERT INTO public.rate_plans (code, name, room_type_id, base_nightly_cents, weekend_nightly_cents, weekend_days, is_active, effective_from, effective_to)
VALUES (
  'STANDARD-DEFAULT',
  'Standard Room Default Rate',
  (SELECT id FROM public.room_types WHERE code = 'STANDARD'),
  9900, 13400,
  '{5,6}',
  true,
  '2026-11-01', '2027-01-31'
)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  room_type_id = EXCLUDED.room_type_id,
  base_nightly_cents = EXCLUDED.base_nightly_cents,
  weekend_nightly_cents = EXCLUDED.weekend_nightly_cents,
  weekend_days = EXCLUDED.weekend_days,
  effective_from = EXCLUDED.effective_from,
  effective_to = EXCLUDED.effective_to,
  updated_at = now();