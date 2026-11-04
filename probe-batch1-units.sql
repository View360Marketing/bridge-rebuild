BEGIN;
INSERT INTO public.units (
  id, unit_code, name, description, unit_kind, max_guests, max_adults, max_children,
  bedrooms, beds, bathrooms, base_rate_cents, currency, property_id, room_type_id,
  is_published, is_closed, hostaway_listing_id, hostaway_source_url, hostaway_record_kind,
  hostaway_review_required, hostaway_media_expected, hostaway_media_copied, created_at, updated_at
) VALUES (
  gen_random_uuid(), 'HOSTAWAY-318378', 'Getaway at Springer''s Catch!', 'You won’t want to leave this charming, one-of-a-kind place. The bridges offers cabin rentals, serene views, and on-site amenities that include: free wifi, fully equipped gym, heated indoor pool, hot tub, sun deck, sauna, basketball court, pickleball court, racquetball, fire pit, charcoal grill, dining hall, rec room, coined laundry and more.', 'cabin',
  4, 0, 0, 1, 2, 1, 9900, 'USD',
  (SELECT id FROM public.properties LIMIT 1), NULL,
  false, true, '318378', 'https://thebridgestn.holidayfuture.com/listings/318378', 'lodging_unit',
  true, 35, 0, now(), now()
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
  updated_at = now();
INSERT INTO public.units (
  id, unit_code, name, description, unit_kind, max_guests, max_adults, max_children,
  bedrooms, beds, bathrooms, base_rate_cents, currency, property_id, room_type_id,
  is_published, is_closed, hostaway_listing_id, hostaway_source_url, hostaway_record_kind,
  hostaway_review_required, hostaway_media_expected, hostaway_media_copied, created_at, updated_at
) VALUES (
  gen_random_uuid(), 'HOSTAWAY-318377', 'Getaway at Trapper Lodge', 'You won’t want to leave this charming, one-of-a-kind place. The bridges offers cabin rentals, serene views, and on-site amenities that include: free wifi, fully equipped gym, heated indoor pool, hot tub, sun deck, sauna, basketball court, pickleball court, racquetball, fire pit, charcoal grill, dining hall, rec room, coined laundry and more.', 'cabin',
  2, 0, 0, 1, 1, 1, 12999, 'USD',
  (SELECT id FROM public.properties LIMIT 1), NULL,
  false, true, '318377', 'https://thebridgestn.holidayfuture.com/listings/318377', 'lodging_unit',
  true, 35, 0, now(), now()
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
  updated_at = now();
INSERT INTO public.units (
  id, unit_code, name, description, unit_kind, max_guests, max_adults, max_children,
  bedrooms, beds, bathrooms, base_rate_cents, currency, property_id, room_type_id,
  is_published, is_closed, hostaway_listing_id, hostaway_source_url, hostaway_record_kind,
  hostaway_review_required, hostaway_media_expected, hostaway_media_copied, created_at, updated_at
) VALUES (
  gen_random_uuid(), 'HOSTAWAY-318379', 'Getaway to the Red House', 'You won’t want to leave this charming, one-of-a-kind place. The bridges offers cabin rentals, serene views, and on-site amenities that include: free wifi, fully equipped gym, heated indoor pool, hot tub, sun deck, sauna, basketball court, pickleball court, racquetball, fire pit, charcoal grill, dining hall, rec room, coined laundry and more.', 'cabin',
  4, 0, 0, 2, 2, 1, 12999, 'USD',
  (SELECT id FROM public.properties LIMIT 1), NULL,
  false, true, '318379', 'https://thebridgestn.holidayfuture.com/listings/318379', 'lodging_unit',
  true, 37, 0, now(), now()
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
  updated_at = now();
INSERT INTO public.units (
  id, unit_code, name, description, unit_kind, max_guests, max_adults, max_children,
  bedrooms, beds, bathrooms, base_rate_cents, currency, property_id, room_type_id,
  is_published, is_closed, hostaway_listing_id, hostaway_source_url, hostaway_record_kind,
  hostaway_review_required, hostaway_media_expected, hostaway_media_copied, created_at, updated_at
) VALUES (
  gen_random_uuid(), 'HOSTAWAY-318381', 'Getaway at Crockett''s Lookout', 'You won’t want to leave this charming, one-of-a-kind place.  The bridges offers cabin rentals, serene views, and on-site amenities that include:  free wifi,  indoor pool, hot tub, sun deck, sauna, basketball court, fire pits, charcoal grill, dining hall, rec room, coined laundry and more.', 'room',
  4, 0, 0, 1, 3, 1, 14900, 'USD',
  (SELECT id FROM public.properties LIMIT 1), NULL,
  false, true, '318381', 'https://thebridgestn.holidayfuture.com/listings/318381', 'lodging_unit',
  true, 37, 0, now(), now()
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
  updated_at = now();
INSERT INTO public.units (
  id, unit_code, name, description, unit_kind, max_guests, max_adults, max_children,
  bedrooms, beds, bathrooms, base_rate_cents, currency, property_id, room_type_id,
  is_published, is_closed, hostaway_listing_id, hostaway_source_url, hostaway_record_kind,
  hostaway_review_required, hostaway_media_expected, hostaway_media_copied, created_at, updated_at
) VALUES (
  gen_random_uuid(), 'HOSTAWAY-318380', 'Gateway to Nature''s beauty Rm 11', 'You won’t want to leave this charming, one-of-a-kind place.  The bridges offers cabin rentals, serene views, and on-site amenities that include:  free wifi,  indoor pool, hot tub, sun deck, sauna, basketball court, fire pits, charcoal grill, dining hall, rec room, coined laundry and more.', 'room',
  3, 0, 0, 1, 2, 1, 12999, 'USD',
  (SELECT id FROM public.properties LIMIT 1), NULL,
  false, true, '318380', 'https://thebridgestn.holidayfuture.com/listings/318380', 'lodging_unit',
  true, 32, 0, now(), now()
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
  updated_at = now();
INSERT INTO public.units (
  id, unit_code, name, description, unit_kind, max_guests, max_adults, max_children,
  bedrooms, beds, bathrooms, base_rate_cents, currency, property_id, room_type_id,
  is_published, is_closed, hostaway_listing_id, hostaway_source_url, hostaway_record_kind,
  hostaway_review_required, hostaway_media_expected, hostaway_media_copied, created_at, updated_at
) VALUES (
  gen_random_uuid(), 'HOSTAWAY-318382', 'Gateway to Nature''s beauty Rm 12', 'You won’t want to leave this charming, one-of-a-kind place.  The bridges offers cabin rentals, serene views, and on-site amenities that include:  free wifi,  indoor pool, hot tub, sun deck, sauna, basketball court, fire pits, charcoal grill, dining hall, rec room, coined laundry and more.', 'room',
  2, 0, 0, 1, 1, 1, 12999, 'USD',
  (SELECT id FROM public.properties LIMIT 1), NULL,
  false, true, '318382', 'https://thebridgestn.holidayfuture.com/listings/318382', 'lodging_unit',
  true, 31, 0, now(), now()
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
  updated_at = now();
INSERT INTO public.units (
  id, unit_code, name, description, unit_kind, max_guests, max_adults, max_children,
  bedrooms, beds, bathrooms, base_rate_cents, currency, property_id, room_type_id,
  is_published, is_closed, hostaway_listing_id, hostaway_source_url, hostaway_record_kind,
  hostaway_review_required, hostaway_media_expected, hostaway_media_copied, created_at, updated_at
) VALUES (
  gen_random_uuid(), 'HOSTAWAY-318383', 'Gateway to Nature''s Beauty Rm 15', 'You won’t want to leave this charming, one-of-a-kind place.  Get away from the daily hustle and bustle.  We offer cabin rentals, serene views, and on-site amenities.  Included is full access to indoor pool, hot tub, sun deck, sauna, basketball court, ping pong, fire pit, reading lounge, charcoal grills, dining hall, hiking trails, fishing, coined laundry, general store, and more.', 'room',
  2, 0, 0, 1, 1, 1, 12999, 'USD',
  (SELECT id FROM public.properties LIMIT 1), NULL,
  false, true, '318383', 'https://thebridgestn.holidayfuture.com/listings/318383', 'lodging_unit',
  true, 31, 0, now(), now()
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
  updated_at = now();
INSERT INTO public.units (
  id, unit_code, name, description, unit_kind, max_guests, max_adults, max_children,
  bedrooms, beds, bathrooms, base_rate_cents, currency, property_id, room_type_id,
  is_published, is_closed, hostaway_listing_id, hostaway_source_url, hostaway_record_kind,
  hostaway_review_required, hostaway_media_expected, hostaway_media_copied, created_at, updated_at
) VALUES (
  gen_random_uuid(), 'HOSTAWAY-318384', 'Serene Cedar''s Edge Room 1', 'You won’t want to leave this charming, one-of-a-kind place.  The bridges offers cabin rentals, serene views, and on-site amenities that include:  free wifi,  indoor pool, hot tub, sun deck, sauna, basketball court, fire pits, charcoal grill, dining hall, rec room, coined laundry and more.', 'room',
  4, 0, 0, 1, 2, 1, 12999, 'USD',
  (SELECT id FROM public.properties LIMIT 1), NULL,
  false, true, '318384', 'https://thebridgestn.holidayfuture.com/listings/318384', 'lodging_unit',
  true, 29, 0, now(), now()
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
  updated_at = now();
INSERT INTO public.units (
  id, unit_code, name, description, unit_kind, max_guests, max_adults, max_children,
  bedrooms, beds, bathrooms, base_rate_cents, currency, property_id, room_type_id,
  is_published, is_closed, hostaway_listing_id, hostaway_source_url, hostaway_record_kind,
  hostaway_review_required, hostaway_media_expected, hostaway_media_copied, created_at, updated_at
) VALUES (
  gen_random_uuid(), 'HOSTAWAY-318385', 'Gateway to Nature''s Room 14', 'You won’t want to leave this charming, one-of-a-kind place.  The bridges offers cabin rentals, serene views, and on-site amenities that include:  free wifi,  indoor pool, hot tub, sun deck, sauna, basketball court, fire pits, charcoal grill, dining hall, rec room, coined laundry and more.', 'room',
  2, 0, 0, 1, 1, 1, 12999, 'USD',
  (SELECT id FROM public.properties LIMIT 1), NULL,
  false, true, '318385', 'https://thebridgestn.holidayfuture.com/listings/318385', 'lodging_unit',
  true, 32, 0, now(), now()
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
  updated_at = now();
INSERT INTO public.units (
  id, unit_code, name, description, unit_kind, max_guests, max_adults, max_children,
  bedrooms, beds, bathrooms, base_rate_cents, currency, property_id, room_type_id,
  is_published, is_closed, hostaway_listing_id, hostaway_source_url, hostaway_record_kind,
  hostaway_review_required, hostaway_media_expected, hostaway_media_copied, created_at, updated_at
) VALUES (
  gen_random_uuid(), 'HOSTAWAY-318386', 'Gateway to Nature''s Beauty Rm 16', 'You won’t want to leave this charming, one-of-a-kind place.  The bridges offers cabin rentals, serene views, and on-site amenities that include:  free wifi,  indoor pool, hot tub, sun deck, sauna, basketball court, fire pits, charcoal grill, dining hall, rec room, coined laundry and more.', 'room',
  2, 0, 0, 1, 1, 1, 12999, 'USD',
  (SELECT id FROM public.properties LIMIT 1), NULL,
  false, true, '318386', 'https://thebridgestn.holidayfuture.com/listings/318386', 'lodging_unit',
  true, 33, 0, now(), now()
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
  updated_at = now();
INSERT INTO public.units (
  id, unit_code, name, description, unit_kind, max_guests, max_adults, max_children,
  bedrooms, beds, bathrooms, base_rate_cents, currency, property_id, room_type_id,
  is_published, is_closed, hostaway_listing_id, hostaway_source_url, hostaway_record_kind,
  hostaway_review_required, hostaway_media_expected, hostaway_media_copied, created_at, updated_at
) VALUES (
  gen_random_uuid(), 'HOSTAWAY-318387', 'Creeks Bend Room 63', 'You won’t want to leave this charming, one-of-a-kind place.  The bridges offers cabin rentals, serene views, and on-site amenities that include:  free wifi,  indoor pool, hot tub, sun deck, sauna, basketball court, fire pits, charcoal grill, dining hall, rec room, coined laundry and more.', 'room',
  4, 0, 0, 1, 2, 1, 12999, 'USD',
  (SELECT id FROM public.properties LIMIT 1), NULL,
  false, true, '318387', 'https://thebridgestn.holidayfuture.com/listings/318387', 'lodging_unit',
  true, 29, 0, now(), now()
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
  updated_at = now();
INSERT INTO public.units (
  id, unit_code, name, description, unit_kind, max_guests, max_adults, max_children,
  bedrooms, beds, bathrooms, base_rate_cents, currency, property_id, room_type_id,
  is_published, is_closed, hostaway_listing_id, hostaway_source_url, hostaway_record_kind,
  hostaway_review_required, hostaway_media_expected, hostaway_media_copied, created_at, updated_at
) VALUES (
  gen_random_uuid(), 'HOSTAWAY-318388', 'Serene Cedar''s Edge Room 2', 'You won’t want to leave this charming, one-of-a-kind place.  The bridges offers cabin rentals, serene views, and on-site amenities that include:  free wifi,  indoor pool, hot tub, sun deck, sauna, basketball court, fire pits, charcoal grill, dining hall, rec room, coined laundry and more.', 'room',
  4, 0, 0, 1, 2, 1, 12999, 'USD',
  (SELECT id FROM public.properties LIMIT 1), NULL,
  false, true, '318388', 'https://thebridgestn.holidayfuture.com/listings/318388', 'lodging_unit',
  true, 29, 0, now(), now()
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
  updated_at = now();
INSERT INTO public.units (
  id, unit_code, name, description, unit_kind, max_guests, max_adults, max_children,
  bedrooms, beds, bathrooms, base_rate_cents, currency, property_id, room_type_id,
  is_published, is_closed, hostaway_listing_id, hostaway_source_url, hostaway_record_kind,
  hostaway_review_required, hostaway_media_expected, hostaway_media_copied, created_at, updated_at
) VALUES (
  gen_random_uuid(), 'HOSTAWAY-318389', 'Creeks Bend Room 62', 'You won’t want to leave this charming, one-of-a-kind place.  The bridges offers cabin rentals, serene views, and on-site amenities that include:  free wifi,  indoor pool, hot tub, sun deck, sauna, basketball court, fire pits, charcoal grill, dining hall, rec room, coined laundry and more.', 'room',
  4, 0, 0, 1, 2, 1, 12999, 'USD',
  (SELECT id FROM public.properties LIMIT 1), NULL,
  false, true, '318389', 'https://thebridgestn.holidayfuture.com/listings/318389', 'lodging_unit',
  true, 30, 0, now(), now()
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
  updated_at = now();
INSERT INTO public.units (
  id, unit_code, name, description, unit_kind, max_guests, max_adults, max_children,
  bedrooms, beds, bathrooms, base_rate_cents, currency, property_id, room_type_id,
  is_published, is_closed, hostaway_listing_id, hostaway_source_url, hostaway_record_kind,
  hostaway_review_required, hostaway_media_expected, hostaway_media_copied, created_at, updated_at
) VALUES (
  gen_random_uuid(), 'HOSTAWAY-318390', 'Creeks Bend Room 64', 'You won’t want to leave this charming, one-of-a-kind place.  The bridges offers cabin rentals, serene views, and on-site amenities that include:  free wifi,  indoor pool, hot tub, sun deck, sauna, basketball court, fire pits, charcoal grill, dining hall, rec room, coined laundry and more.', 'room',
  4, 0, 0, 1, 2, 1, 12999, 'USD',
  (SELECT id FROM public.properties LIMIT 1), NULL,
  false, true, '318390', 'https://thebridgestn.holidayfuture.com/listings/318390', 'lodging_unit',
  true, 29, 0, now(), now()
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
  updated_at = now();
INSERT INTO public.units (
  id, unit_code, name, description, unit_kind, max_guests, max_adults, max_children,
  bedrooms, beds, bathrooms, base_rate_cents, currency, property_id, room_type_id,
  is_published, is_closed, hostaway_listing_id, hostaway_source_url, hostaway_record_kind,
  hostaway_review_required, hostaway_media_expected, hostaway_media_copied, created_at, updated_at
) VALUES (
  gen_random_uuid(), 'HOSTAWAY-318391', 'Serenity at Rock Retreat Rm 22', 'You won’t want to leave this charming, one-of-a-kind place.  The bridges offers cabin rentals, serene views, and on-site amenities that include:  free wifi,  indoor pool, hot tub, sun deck, sauna, basketball court, fire pits, charcoal grill, dining hall, rec room, coined laundry and more.', 'room',
  3, 0, 0, 1, 2, 1, 12999, 'USD',
  (SELECT id FROM public.properties LIMIT 1), NULL,
  false, true, '318391', 'https://thebridgestn.holidayfuture.com/listings/318391', 'lodging_unit',
  true, 29, 0, now(), now()
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
  updated_at = now();
INSERT INTO public.units (
  id, unit_code, name, description, unit_kind, max_guests, max_adults, max_children,
  bedrooms, beds, bathrooms, base_rate_cents, currency, property_id, room_type_id,
  is_published, is_closed, hostaway_listing_id, hostaway_source_url, hostaway_record_kind,
  hostaway_review_required, hostaway_media_expected, hostaway_media_copied, created_at, updated_at
) VALUES (
  gen_random_uuid(), 'HOSTAWAY-318392', 'Serenity at Rock Retreat Rm 21', 'You won’t want to leave this charming, one-of-a-kind place.  The bridges offers cabin rentals, serene views, and on-site amenities that include:  free wifi,  indoor pool, hot tub, sun deck, sauna, basketball court, fire pits, charcoal grill, dining hall, rec room, coined laundry and more.', 'room',
  3, 0, 0, 1, 2, 1, 12999, 'USD',
  (SELECT id FROM public.properties LIMIT 1), NULL,
  false, true, '318392', 'https://thebridgestn.holidayfuture.com/listings/318392', 'lodging_unit',
  true, 30, 0, now(), now()
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
  updated_at = now();
INSERT INTO public.units (
  id, unit_code, name, description, unit_kind, max_guests, max_adults, max_children,
  bedrooms, beds, bathrooms, base_rate_cents, currency, property_id, room_type_id,
  is_published, is_closed, hostaway_listing_id, hostaway_source_url, hostaway_record_kind,
  hostaway_review_required, hostaway_media_expected, hostaway_media_copied, created_at, updated_at
) VALUES (
  gen_random_uuid(), 'HOSTAWAY-318393', 'Creeks Bend Room 61', 'You won’t want to leave this charming, one-of-a-kind place.  The bridges offers cabin rentals, serene views, and on-site amenities that include:  free wifi,  indoor pool, hot tub, sun deck, sauna, basketball court, fire pits, charcoal grill, dining hall, rec room, coined laundry and more.', 'room',
  4, 0, 0, 1, 2, 1, 12999, 'USD',
  (SELECT id FROM public.properties LIMIT 1), NULL,
  false, true, '318393', 'https://thebridgestn.holidayfuture.com/listings/318393', 'lodging_unit',
  true, 31, 0, now(), now()
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
  updated_at = now();
INSERT INTO public.units (
  id, unit_code, name, description, unit_kind, max_guests, max_adults, max_children,
  bedrooms, beds, bathrooms, base_rate_cents, currency, property_id, room_type_id,
  is_published, is_closed, hostaway_listing_id, hostaway_source_url, hostaway_record_kind,
  hostaway_review_required, hostaway_media_expected, hostaway_media_copied, created_at, updated_at
) VALUES (
  gen_random_uuid(), 'HOSTAWAY-318394', 'Hillside Haven 54', 'You won’t want to leave this charming, one-of-a-kind place.  The bridges offers cabin rentals, serene views, and on-site amenities that include:  free wifi,  indoor pool, hot tub, sun deck, sauna, basketball court, fire pits, charcoal grill, dining hall, rec room, coined laundry and more.', 'room',
  3, 0, 0, 1, 2, 1, 12999, 'USD',
  (SELECT id FROM public.properties LIMIT 1), NULL,
  false, true, '318394', 'https://thebridgestn.holidayfuture.com/listings/318394', 'lodging_unit',
  true, 32, 0, now(), now()
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
  updated_at = now();
COMMIT;