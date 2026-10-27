-- The pricing engine supports a general fallback plan (room_type_id and unit_id both NULL),
-- but rate_plans_check forced at least one to be non-NULL. Drop the constraint so the seasonal
-- general plan can be created; per-unit/per-type plans remain fully supported.
ALTER TABLE public.rate_plans DROP CONSTRAINT IF EXISTS rate_plans_check;

-- Editable season window on the single-row settings table.
ALTER TABLE public.integration_settings
  ADD COLUMN IF NOT EXISTS season_start_date date,
  ADD COLUMN IF NOT EXISTS season_end_date date;

UPDATE public.integration_settings
  SET season_start_date = '2026-11-01',
      season_end_date   = '2027-01-31'
  WHERE id = 1;

-- Add a typed-discount mechanic to promotions (default 'flat' preserves existing behavior).
ALTER TABLE public.promotions
  ADD COLUMN IF NOT EXISTS mechanic text NOT NULL DEFAULT 'flat';

-- Winter 2026-2027 seasonal rate plan (general; applies to room inventory).
-- Mon-Thu = 9900 cents ($99), Fri-Sun = 13400 cents ($134). weekend_days = [5,6,0].
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.rate_plans WHERE code = 'WINTER2627') THEN
    UPDATE public.rate_plans
      SET name = 'Winter Season 2026-2027',
          room_type_id = NULL,
          unit_id = NULL,
          base_nightly_cents = 9900,
          weekend_nightly_cents = 13400,
          weekend_days = ARRAY[5,6,0],
          additional_adult_cents = 0,
          additional_child_cents = 0,
          is_active = true,
          effective_from = '2026-11-01',
          effective_to = '2027-01-31'
      WHERE code = 'WINTER2627';
  ELSE
    INSERT INTO public.rate_plans
      (code, name, room_type_id, unit_id, base_nightly_cents, weekend_nightly_cents,
       weekend_days, additional_adult_cents, additional_child_cents, is_active,
       effective_from, effective_to)
    VALUES
      ('WINTER2627', 'Winter Season 2026-2027', NULL, NULL, 9900, 13400,
       ARRAY[5,6,0], 0, 0, true, '2026-11-01', '2027-01-31');
  END IF;
END $$;

-- Third-night-free promotion for the winter season.
-- Mechanic 'third_night_free' => the server pricing engine itemizes the third
-- occupied night's room charge as a discount. Taxes/fees still apply.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.promotions WHERE code = 'WINTER3FREE') THEN
    UPDATE public.promotions
      SET name = 'Winter Third Night Free',
          mechanic = 'third_night_free',
          discount_percent = NULL,
          discount_cents = NULL,
          is_active = true,
          effective_from = '2026-11-01',
          effective_to = '2027-01-31'
      WHERE code = 'WINTER3FREE';
  ELSE
    INSERT INTO public.promotions
      (code, name, mechanic, discount_percent, discount_cents,
       max_redemptions, redemptions_count, is_active, effective_from, effective_to)
    VALUES
      ('WINTER3FREE', 'Winter Third Night Free', 'third_night_free', NULL, NULL,
       NULL, 0, true, '2026-11-01', '2027-01-31');
  END IF;
END $$;