-- Seasonal offers, venue rate cards, and property events (Nov 2026 - Jan 2027)
-- Adds: promotions.mechanic, seasonal_offers, venue_rate_cards, property_events
-- Seeds the winter lodging offer, Willows/restaurant venue pricing, and December 2026 events.

-- 1. promotions.mechanic -----------------------------------------------------
ALTER TABLE public.promotions
  ADD COLUMN IF NOT EXISTS mechanic text NOT NULL DEFAULT 'flat'
  CHECK (mechanic IN ('flat','percent','third_night_free','nth_night_free'));

-- 2. seasonal_offers ----------------------------------------------------------
-- Editable seasonal lodging offers shown on the homepage / stay pages.
CREATE TABLE IF NOT EXISTS public.seasonal_offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  title text NOT NULL,
  description text NOT NULL,
  weekday_rate_cents int NOT NULL CHECK (weekday_rate_cents >= 0),
  weekend_rate_cents int NOT NULL CHECK (weekend_rate_cents >= 0),
  weekday_label text NOT NULL DEFAULT 'Monday–Thursday',
  weekend_label text NOT NULL DEFAULT 'Friday–Sunday',
  effective_from date NOT NULL,
  effective_to date NOT NULL,
  promotion_code text,
  is_active boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (effective_to >= effective_from)
);
GRANT SELECT ON public.seasonal_offers TO anon, authenticated;
GRANT ALL ON public.seasonal_offers TO service_role;
ALTER TABLE public.seasonal_offers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon read active seasonal offers" ON public.seasonal_offers
  FOR SELECT TO anon USING (is_active);
CREATE POLICY "staff read seasonal offers" ON public.seasonal_offers
  FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "managers manage seasonal offers" ON public.seasonal_offers
  FOR ALL TO authenticated USING (public.is_manager(auth.uid())) WITH CHECK (public.is_manager(auth.uid()));

-- 3. venue_rate_cards ---------------------------------------------------------
-- Editable Willows / restaurant space rental pricing (timed venue, not room-nights).
CREATE TABLE IF NOT EXISTS public.venue_rate_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  label text NOT NULL,
  description text,
  weekday_rate_cents int NOT NULL CHECK (weekday_rate_cents >= 0),
  weekend_rate_cents int NOT NULL CHECK (weekend_rate_cents >= 0),
  weekday_label text NOT NULL DEFAULT 'Monday–Friday',
  weekend_label text NOT NULL DEFAULT 'Saturday–Sunday',
  duration_hours int NOT NULL DEFAULT 5 CHECK (duration_hours > 0),
  max_guests int,
  includes text[] NOT NULL DEFAULT '{}',
  excludes_weddings boolean NOT NULL DEFAULT false,
  catering_offer_note text,
  catering_weekday_rate_cents int,
  inquiry_category text NOT NULL DEFAULT 'General',
  is_active boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.venue_rate_cards TO anon, authenticated;
GRANT ALL ON public.venue_rate_cards TO service_role;
ALTER TABLE public.venue_rate_cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon read active venue rate cards" ON public.venue_rate_cards
  FOR SELECT TO anon USING (is_active);
CREATE POLICY "staff read venue rate cards" ON public.venue_rate_cards
  FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "managers manage venue rate cards" ON public.venue_rate_cards
  FOR ALL TO authenticated USING (public.is_manager(auth.uid())) WITH CHECK (public.is_manager(auth.uid()));

-- 4. property_events ----------------------------------------------------------
-- Editable December 2026 events shown on the events page.
CREATE TABLE IF NOT EXISTS public.property_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  title text NOT NULL,
  subtitle text,
  description text,
  event_date date NOT NULL,
  start_time text,
  end_time text,
  location text,
  is_tentative boolean NOT NULL DEFAULT false,
  is_confirmed boolean NOT NULL DEFAULT true,
  includes_overnight_access boolean NOT NULL DEFAULT false,
  sort_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.property_events TO anon, authenticated;
GRANT ALL ON public.property_events TO service_role;
ALTER TABLE public.property_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon read active property events" ON public.property_events
  FOR SELECT TO anon USING (is_active);
CREATE POLICY "staff read property events" ON public.property_events
  FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "managers manage property events" ON public.property_events
  FOR ALL TO authenticated USING (public.is_manager(auth.uid())) WITH CHECK (public.is_manager(auth.uid()));

-- 5. Seed the winter lodging offer -------------------------------------------
INSERT INTO public.seasonal_offers (code, title, description, weekday_rate_cents, weekend_rate_cents, effective_from, effective_to, promotion_code, sort_order)
VALUES (
  'winter-2026-2027',
  'Your Winter Getaway Starts Here',
  'Stay November 1–January 31 for $99 per night Monday–Thursday or $134 per night Friday–Sunday, plus taxes and fees. Book two nights and get your third night free.',
  9900, 13400,
  '2026-11-01', '2027-01-31',
  'THIRD-NIGHT-FREE',
  0
)
ON CONFLICT (code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  weekday_rate_cents = EXCLUDED.weekday_rate_cents,
  weekend_rate_cents = EXCLUDED.weekend_rate_cents,
  effective_from = EXCLUDED.effective_from,
  effective_to = EXCLUDED.effective_to,
  updated_at = now();

-- Third-night-free promotion (mechanic = third_night_free). Discount is the
-- third eligible night's room charge, itemized by the pricing engine. The
-- automatic promotional checkout remains disabled until an admin reviews the
-- unresolved stacking/repeat/season-boundary rules (see is_active = false).
INSERT INTO public.promotions (code, name, mechanic, discount_percent, discount_cents, effective_from, effective_to, is_active)
VALUES (
  'THIRD-NIGHT-FREE',
  'Winter Third Night Free',
  'third_night_free',
  NULL, NULL,
  '2026-11-01', '2027-01-31',
  false
)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  mechanic = EXCLUDED.mechanic,
  effective_from = EXCLUDED.effective_from,
  effective_to = EXCLUDED.effective_to;

-- 6. Seed Willows venue rate card ---------------------------------------------
INSERT INTO public.venue_rate_cards (code, label, description, weekday_rate_cents, weekend_rate_cents, duration_hours, includes, excludes_weddings, catering_offer_note, catering_weekday_rate_cents, inquiry_category, sort_order)
VALUES (
  'willows-rental',
  'The Willows Event Center Rental',
  'Private event rental of The Willows for gatherings, retreats, and special events. Tables and chairs included. These rates exclude weddings.',
  50000, 80000, 5,
  ARRAY['Tables and chairs'],
  true,
  'Planning a weekend gathering? Book catering with us and receive the weekday venue rental rate: $500 for 5 hours, plus catering costs.',
  50000,
  'Retreat',
  0
)
ON CONFLICT (code) DO UPDATE SET
  label = EXCLUDED.label,
  description = EXCLUDED.description,
  weekday_rate_cents = EXCLUDED.weekday_rate_cents,
  weekend_rate_cents = EXCLUDED.weekend_rate_cents,
  duration_hours = EXCLUDED.duration_hours,
  includes = EXCLUDED.includes,
  excludes_weddings = EXCLUDED.excludes_weddings,
  catering_offer_note = EXCLUDED.catering_offer_note,
  catering_weekday_rate_cents = EXCLUDED.catering_weekday_rate_cents,
  inquiry_category = EXCLUDED.inquiry_category,
  updated_at = now();

-- 7. Seed restaurant space rental rate card ----------------------------------
INSERT INTO public.venue_rate_cards (code, label, description, weekday_rate_cents, weekend_rate_cents, duration_hours, max_guests, includes, excludes_weddings, inquiry_category, sort_order)
VALUES (
  'restaurant-space-rental',
  'Restaurant Space Rental',
  'Private rental of the restaurant space for gatherings and events. Up to 75 people. Food, catering, kitchen access, staffing, and other services are not included unless separately confirmed.',
  25000, 25000, 5, 75,
  ARRAY[]::text[],
  false,
  'General',
  1
)
ON CONFLICT (code) DO UPDATE SET
  label = EXCLUDED.label,
  description = EXCLUDED.description,
  weekday_rate_cents = EXCLUDED.weekday_rate_cents,
  weekend_rate_cents = EXCLUDED.weekend_rate_cents,
  duration_hours = EXCLUDED.duration_hours,
  max_guests = EXCLUDED.max_guests,
  updated_at = now();

-- 8. Seed December 2026 events -----------------------------------------------
INSERT INTO public.property_events (code, title, subtitle, description, event_date, start_time, end_time, location, is_tentative, is_confirmed, includes_overnight_access, sort_order) VALUES
  ('dec-5-grinchmas-breakfast', 'Grinchmas Breakfast', NULL, 'A festive holiday breakfast at The Bridges.', '2026-12-05', '09:00', '11:00', NULL, false, true, true, 0),
  ('dec-10-holiday-movie-night', 'The Holiday Movie Night', 'Girls’ night at The Willows.', 'Time and additional details to be announced.', '2026-12-10', NULL, NULL, 'The Willows', false, true, true, 1),
  ('dec-12-elf-academy-day', 'Elf Academy Day with Characters', NULL, 'Time and additional details to be announced.', '2026-12-12', NULL, NULL, NULL, false, true, true, 2),
  ('dec-18-character-night', 'Possible Character Night', 'Tentative', 'Details and confirmation to be announced. A character night is being considered for December 18.', '2026-12-18', NULL, NULL, NULL, true, false, false, 3),
  ('dec-19-polar-express-movie-night', 'Polar Express Movie Night', NULL, 'Time and additional details to be announced.', '2026-12-19', NULL, NULL, NULL, false, true, true, 4)
ON CONFLICT (code) DO UPDATE SET
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  description = EXCLUDED.description,
  event_date = EXCLUDED.event_date,
  start_time = EXCLUDED.start_time,
  end_time = EXCLUDED.end_time,
  location = EXCLUDED.location,
  is_tentative = EXCLUDED.is_tentative,
  is_confirmed = EXCLUDED.is_confirmed,
  includes_overnight_access = EXCLUDED.includes_overnight_access,
  updated_at = now();