-- Christmas campaign: update December 2026 events with full details, add WINTER26 promo code,
-- and reconcile the seasonal offer so WINTER26 does not double-discount.

-- 1. Reconcile promotions: make WINTER26 the single active third_night_free promo.
--    Deactivate the older WINTER3FREE / THIRD-NIGHT-FREE duplicates so the pricing engine's
--    "active third_night free" fallback resolves to exactly one promotion.
UPDATE public.promotions SET is_active = false WHERE code IN ('WINTER3FREE','THIRD-NIGHT-FREE');

INSERT INTO public.promotions (code, name, mechanic, discount_percent, discount_cents, effective_from, effective_to, is_active)
VALUES ('WINTER26','Winter Third Night Free','third_night_free', NULL, NULL, '2026-11-01','2027-01-31', true)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  mechanic = EXCLUDED.mechanic,
  effective_from = EXCLUDED.effective_from,
  effective_to = EXCLUDED.effective_to,
  is_active = true;

-- 2. Point the seasonal offer at WINTER26.
UPDATE public.seasonal_offers
  SET promotion_code = 'WINTER26', updated_at = now()
  WHERE code = 'winter-2026-2027';

-- 3. Update the December 2026 events with the owners' confirmed details.
--    Dec 18 stays tentative + unconfirmed (kept out of public confirmed lists).

UPDATE public.property_events SET
  title = 'Grinchmas Breakfast Experience',
  description = 'A family-friendly Christmas breakfast with festive food, Grinch character interactions, photo opportunities, and holiday activities. Advance purchase or reservation required — no unreserved ticket sales at the door. Adults (13+): $10. Children (4–12): $20 (admission, breakfast, games, activities, and photos). Ages 3 and under: free.',
  start_time = '09:00', end_time = '11:00',
  is_tentative = false, is_confirmed = true, includes_overnight_access = true,
  updated_at = now()
WHERE code = 'dec-5-grinchmas-breakfast';

UPDATE public.property_events SET
  title = 'The Holiday Girls Night Movie Experience',
  subtitle = 'Girls'' night at The Willows.',
  description = 'A cozy indoor showing of The Holiday. Wear pajamas or something comfortable, and bring a chair or blanket. Standard admission: $20 per person. Groups of five or more: $15 per person. Cocoa, a drink, popcorn and a sweet treat, a Christmas craft, and a photo area are potential activities — confirm inclusions when you reserve.',
  start_time = '18:00', end_time = '21:00',
  location = 'The Willows',
  is_tentative = false, is_confirmed = true, includes_overnight_access = true,
  updated_at = now()
WHERE code = 'dec-10-holiday-movie-night';

UPDATE public.property_events SET
  title = 'Elf Training Academy',
  description = 'Children complete festive games, activities, and challenges to become official Christmas elves, with lights available afterward. Adults (13+): $12 (admission and lights). Children (4–12): $20 (admission, games, activities, and lights). Ages 3 and under: free. Time to be announced.',
  start_time = NULL, end_time = NULL,
  is_tentative = false, is_confirmed = true, includes_overnight_access = true,
  updated_at = now()
WHERE code = 'dec-12-elf-academy-day';

UPDATE public.property_events SET
  title = 'Polar Express Movie Night Experience',
  description = 'The Polar Express screening with golden admission tickets, hot chocolate, popcorn, a special bell, holiday photo opportunities, a letter-to-Santa station, and lights at The Bridges. Christmas pajamas encouraged. Adults (13+): $15. Children (4–12): $25. Ages 3 and under: free. Time to be announced.',
  start_time = NULL, end_time = NULL,
  is_tentative = false, is_confirmed = true, includes_overnight_access = true,
  updated_at = now()
WHERE code = 'dec-19-polar-express-movie-night';

-- Dec 18 stays tentative and is NOT confirmed. Keep it out of public confirmed lists.
UPDATE public.property_events SET
  title = 'Christmas Character Night & Lights',
  description = 'A character night is being considered for December 18. Details and confirmation to be announced.',
  is_tentative = true, is_confirmed = false, includes_overnight_access = false,
  updated_at = now()
WHERE code = 'dec-18-character-night';