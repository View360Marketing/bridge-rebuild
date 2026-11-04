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
INSERT INTO public.units (
  id, unit_code, name, description, unit_kind, max_guests, max_adults, max_children,
  bedrooms, beds, bathrooms, base_rate_cents, currency, property_id, room_type_id,
  is_published, is_closed, hostaway_listing_id, hostaway_source_url, hostaway_record_kind,
  hostaway_review_required, hostaway_media_expected, hostaway_media_copied, created_at, updated_at
) VALUES (
  gen_random_uuid(), 'HOSTAWAY-318396', 'Hillside Haven 52', 'You won’t want to leave this charming, one-of-a-kind place.  The bridges offers cabin rentals, serene views, and on-site amenities that include:  free wifi,  indoor pool, hot tub, sun deck, sauna, basketball court, fire pits, charcoal grill, dining hall, rec room, coined laundry and more.', 'room',
  3, 0, 0, 1, 2, 1, 12999, 'USD',
  (SELECT id FROM public.properties LIMIT 1), NULL,
  false, true, '318396', 'https://thebridgestn.holidayfuture.com/listings/318396', 'lodging_unit',
  true, 34, 0, now(), now()
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
  gen_random_uuid(), 'HOSTAWAY-318395', 'Serenity at Rock Retreat Room 23', 'You won’t want to leave this charming, one-of-a-kind place.  The bridges offers cabin rentals, serene views, and on-site amenities that include:  free wifi,  indoor pool, hot tub, sun deck, sauna, basketball court, fire pits, charcoal grill, dining hall, rec room, coined laundry and more.', 'room',
  3, 0, 0, 1, 2, 1, 12999, 'USD',
  (SELECT id FROM public.properties LIMIT 1), NULL,
  false, true, '318395', 'https://thebridgestn.holidayfuture.com/listings/318395', 'lodging_unit',
  true, 25, 0, now(), now()
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
  gen_random_uuid(), 'HOSTAWAY-318397', 'Serenity at Rock Retreat Room 24', 'You won’t want to leave this charming, one-of-a-kind place.  Get away from the hustle and bustle of everyday noise.   We offer cabin rentals, serene views, and on-site amenities.  We offer full access gym, indoor heated pool, sauna, fire pit, charcoal grills, basketball, racquetball, pickleball, dining hall, fishing, hiking, general store, and more.', 'room',
  3, 0, 0, 1, 2, 1, 12999, 'USD',
  (SELECT id FROM public.properties LIMIT 1), NULL,
  false, true, '318397', 'https://thebridgestn.holidayfuture.com/listings/318397', 'lodging_unit',
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
  gen_random_uuid(), 'HOSTAWAY-318398', 'Hillside Haven Room 51', 'You won’t want to leave this charming, one-of-a-kind place. The bridges offers cabin rentals, serene views, and on-site amenities that include: free wifi, fully equipped gym, heated indoor pool, hot tub, sun deck, sauna, basketball court, pickleball court, racquetball, fire pit, charcoal grill, dining hall, rec room, coined laundry and more.', 'room',
  3, 0, 0, 1, 2, 1, 12999, 'USD',
  (SELECT id FROM public.properties LIMIT 1), NULL,
  false, true, '318398', 'https://thebridgestn.holidayfuture.com/listings/318398', 'lodging_unit',
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
  gen_random_uuid(), 'HOSTAWAY-318399', 'Frontier Hideaway Room 31', 'You won’t want to leave this charming, one-of-a-kind place.  Get away from the hustle and bustle of all the noise in everyday life where there is the only double span natural bridges.  We offer cabin rental, serene views, and on-site amenities.  We have full access to a gym, sauna, indoor heated pool, basketball, racquetball, pickleball, charcoal grills, fire pits, hiking, fishing, dining hall, general store, and much more.', 'room',
  3, 0, 0, 1, 2, 1, 12999, 'USD',
  (SELECT id FROM public.properties LIMIT 1), NULL,
  false, true, '318399', 'https://thebridgestn.holidayfuture.com/listings/318399', 'lodging_unit',
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
  gen_random_uuid(), 'HOSTAWAY-318400', 'Hillside Haven 53', 'You won’t want to leave this charming, one-of-a-kind place. The bridges offers cabin rentals, serene views, and on-site amenities that include: free wifi, fully equipped gym, heated indoor pool, hot tub, sun deck, sauna, basketball court, pickleball court, racquetball, fire pit, charcoal grill, dining hall, rec room, coined laundry and more.', 'room',
  3, 0, 0, 1, 2, 1, 12999, 'USD',
  (SELECT id FROM public.properties LIMIT 1), NULL,
  false, true, '318400', 'https://thebridgestn.holidayfuture.com/listings/318400', 'lodging_unit',
  true, 28, 0, now(), now()
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
  gen_random_uuid(), 'HOSTAWAY-318401', 'Owls Nest 44', 'You won’t want to leave this charming, one-of-a-kind place. The bridges offers cabin rentals, serene views, and on-site amenities that include: free wifi, fully equipped gym, heated indoor pool, hot tub, sun deck, sauna, basketball court, pickleball court, racquetball, fire pit, charcoal grill, dining hall, rec room, coined laundry and more.', 'room',
  3, 0, 0, 1, 2, 1, 12999, 'USD',
  (SELECT id FROM public.properties LIMIT 1), NULL,
  false, true, '318401', 'https://thebridgestn.holidayfuture.com/listings/318401', 'lodging_unit',
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
  gen_random_uuid(), 'HOSTAWAY-318402', 'Frontier Hideaway Room 33', 'You won’t want to leave this charming, one-of-a-kind place.  Get away from the hustle and bustle of everyday noise at the only double span natural bridges.  We offer cabin rentals, serene views, and on-site amenities.  We have full access gym, indoor heated pool, sauna, fire pit, charcoal grills, hiking, fishing, basketball, pickleball, coined laundry, dining hall, reading lounge, ping pong, general store, and many more.', 'room',
  3, 0, 0, 1, 2, 1, 12999, 'USD',
  (SELECT id FROM public.properties LIMIT 1), NULL,
  false, true, '318402', 'https://thebridgestn.holidayfuture.com/listings/318402', 'lodging_unit',
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
  gen_random_uuid(), 'HOSTAWAY-318403', 'Frontier Hideaway Room 32', 'You won’t want to leave this charming, one-of-a-kind place.  Get away from the hustle and bustle of everyday noise at the natural bridges with the only double span natural bridges in the world.  We offer cabin rentals, serene views, and on-site amenities.  We also offer full access to a gym, indoor heated pool, sauna, racquetball, pickleball, fire pits, charcoal grills, hiking, fishing, basketball, coined laundry, dining hall, a general store and much more.', 'room',
  3, 0, 0, 1, 2, 1, 12999, 'USD',
  (SELECT id FROM public.properties LIMIT 1), NULL,
  false, true, '318403', 'https://thebridgestn.holidayfuture.com/listings/318403', 'lodging_unit',
  true, 25, 0, now(), now()
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
  gen_random_uuid(), 'HOSTAWAY-318404', 'Owls Nest 43', 'You won’t want to leave this charming, one-of-a-kind place. The bridges offers cabin rentals, serene views, and on-site amenities that include: free wifi, fully equipped gym, heated indoor pool, hot tub, sun deck, sauna, basketball court, pickleball court, racquetball, fire pit, charcoal grill, dining hall, rec room, coined laundry and more.', 'room',
  3, 0, 0, 1, 2, 1, 12999, 'USD',
  (SELECT id FROM public.properties LIMIT 1), NULL,
  false, true, '318404', 'https://thebridgestn.holidayfuture.com/listings/318404', 'lodging_unit',
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
  gen_random_uuid(), 'HOSTAWAY-318405', 'Owls Nest Room 42', 'You won’t want to leave this charming, one-of-a-kind place. The bridges offers cabin rentals, serene views, and on-site amenities that include: free wifi, fully equipped gym, heated indoor pool, hot tub, sun deck, sauna, basketball court, pickleball court, racquetball, fire pit, charcoal grill, dining hall, rec room, coined laundry and more.', 'room',
  3, 0, 0, 1, 2, 1, 12999, 'USD',
  (SELECT id FROM public.properties LIMIT 1), NULL,
  false, true, '318405', 'https://thebridgestn.holidayfuture.com/listings/318405', 'lodging_unit',
  true, 25, 0, now(), now()
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
  gen_random_uuid(), 'HOSTAWAY-318406', 'Owls Nest Room 41', 'You won’t want to leave this charming, one-of-a-kind place. The bridges offers cabin rentals, serene views, and on-site amenities that include: free wifi, fully equipped gym, heated indoor pool, hot tub, sun deck, sauna, basketball court, pickleball court, racquetball, fire pit, charcoal grill, dining hall, rec room, coined laundry and more.', 'room',
  3, 0, 0, 1, 2, 1, 12999, 'USD',
  (SELECT id FROM public.properties LIMIT 1), NULL,
  false, true, '318406', 'https://thebridgestn.holidayfuture.com/listings/318406', 'lodging_unit',
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
  gen_random_uuid(), 'HOSTAWAY-318407', 'Frontier Hideaway Room 34', 'You won’t want to leave this charming, one-of-a-kind place.  Get away from the hustle and bustle to the only natural double span bridges in the world.  We offer cabins, serene views, and on-site amenities, and much more.', 'room',
  3, 0, 0, 1, 2, 1, 12999, 'USD',
  (SELECT id FROM public.properties LIMIT 1), NULL,
  false, true, '318407', 'https://thebridgestn.holidayfuture.com/listings/318407', 'lodging_unit',
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
  gen_random_uuid(), 'HOSTAWAY-347720', 'Jessie''s Hideaway', 'You won’t want to leave this charming, one-of-a-kind place.  Get away from the hustle and bustle of all the noise in everyday life where there is the only double span natural bridges.  We offer cabin rental, serene views, and on-site amenities.  We have full access to a gym, sauna, indoor heated pool, basketball, racquetball, pickleball, charcoal grills, fire pits, hiking, fishing, dining hall, general store, and much more.', 'cabin',
  2, 0, 0, 1, 1, 1, 12500, 'USD',
  (SELECT id FROM public.properties LIMIT 1), NULL,
  false, true, '347720', 'https://thebridgestn.holidayfuture.com/listings/347720', 'lodging_unit',
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
  gen_random_uuid(), 'HOSTAWAY-347721', 'Frank''s Retreat', 'You won’t want to leave this charming, one-of-a-kind place. Get away from the hustle and bustle of all the noise in everyday life where there is the only double span natural bridges.  We offer cabin rental, serene views, and on-site amenities.  We have full access to a gym, sauna, indoor heated pool, basketball, racquetball, pickleball, charcoal grills, fire pits, hiking, fishing, dining hall, general store, and much more.', 'cabin',
  4, 0, 0, 2, 2, 2, 20000, 'USD',
  (SELECT id FROM public.properties LIMIT 1), NULL,
  false, true, '347721', 'https://thebridgestn.holidayfuture.com/listings/347721', 'lodging_unit',
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
  gen_random_uuid(), 'HOSTAWAY-416928', 'RV Park (Pet Friendly): Basic Package', 'Enjoy the beauty of nature without sacrificing comfort at The Bridges in Waynesboro, TN. Our 6 spacious, pet-friendly RV sites come with full hookups—water, sewer, and electric—and are available for both short-term getaways and long-term stays. **RV NOT INCLUDED**
Whether you’re just passing through or looking for an extended escape, we offer the flexibility you need in a peaceful, resort-style setting.
Our Basic RV Park Package gives you access to hookup. Our Deluxe Package gives you hookup PLUS full access to our amenities.', 'rv_site',
  10, 0, 0, 0, 0, 0, 5000, 'USD',
  (SELECT id FROM public.properties LIMIT 1), NULL,
  false, true, '416928', 'https://thebridgestn.holidayfuture.com/listings/416928', 'rv_package_offer',
  true, 1, 0, now(), now()
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
  gen_random_uuid(), 'HOSTAWAY-416933', 'RV Park (Pet Friendly): Deluxe Package', 'Enjoy the beauty of nature without sacrificing comfort at The Bridges in Waynesboro, TN. Our 6 spacious, pet-friendly RV sites come with full hookups—water, sewer, and electric—and are available for both short-term getaways and long-term stays.  **RV NOT INCLUDED**
Whether you’re just passing through or looking for an extended escape, we offer the flexibility you need in a peaceful, resort-style setting.
$50/night - includes hookup
$75/night – Includes hookup, full access to the resort, including hiking trails, pool, sauna, and more!
Come for a night or stay awhile—your RV adventure starts here at The Bridges.', 'rv_site',
  8, 0, 0, 0, 0, 0, 7500, 'USD',
  (SELECT id FROM public.properties LIMIT 1), NULL,
  false, true, '416933', 'https://thebridgestn.holidayfuture.com/listings/416933', 'rv_package_offer',
  true, 8, 0, now(), now()
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
