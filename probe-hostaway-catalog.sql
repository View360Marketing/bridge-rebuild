INSERT INTO public.hostaway_catalog (listing_id, unit_id, source, imported_at)
SELECT '318378', u.id, '{"name":"Getaway at Springer''s Catch!","public_name":"Getaway at Springer''s Catch!","description":"You won’t want to leave this charming, one-of-a-kind place. The bridges offers cabin rentals, serene views, and on-site amenities that include: free wifi, fully equipped gym, heated indoor pool, hot tub, sun deck, sauna, basketball court, pickleball court, racquetball, fire pit, charcoal grill, dining hall, rec room, coined laundry and more.","property_type":"Cabin","kind":"lodging_unit","max_guests":4,"max_adults":null,"max_children":null,"bedrooms":1,"beds":2,"bathrooms":1,"base_rate_cents":9900,"currency":"USD","house_rules":null,"amenities":["Swimming pool","Air conditioning","Pets allowed","Suitable for children","Internet","Wireless","Smoke detector","Carbon Monoxide Detector","First aid kit","Fire Extinguisher","TV","Outdoor grill","Jacuzzi","Fire pit","Exercise equipment"],"bookable":true,"shared_inventory_group":null,"review_notes":["Source base rate is a snapshot, not a date-specific quote. Preserve existing approved seasonal rate plans.","Guest split, cleaning fee and Airbnb ID are not verified by this public source."],"sort_order":0}'::jsonb, now()
FROM public.units u WHERE u.hostaway_listing_id = '318378'
ON CONFLICT (listing_id) DO UPDATE SET
  unit_id = EXCLUDED.unit_id,
  source = EXCLUDED.source,
  imported_at = now();

INSERT INTO public.hostaway_catalog (listing_id, unit_id, source, imported_at)
SELECT '318377', u.id, '{"name":"Getaway at Trapper Lodge","public_name":"Getaway at Trapper Lodge","description":"You won’t want to leave this charming, one-of-a-kind place. The bridges offers cabin rentals, serene views, and on-site amenities that include: free wifi, fully equipped gym, heated indoor pool, hot tub, sun deck, sauna, basketball court, pickleball court, racquetball, fire pit, charcoal grill, dining hall, rec room, coined laundry and more.","property_type":"Cabin","kind":"lodging_unit","max_guests":2,"max_adults":null,"max_children":null,"bedrooms":1,"beds":1,"bathrooms":1,"base_rate_cents":12999,"currency":"USD","house_rules":null,"amenities":["Swimming pool","Air conditioning","Pets allowed","Suitable for children","Internet","Wireless","Smoke detector","Carbon Monoxide Detector","First aid kit","Fire Extinguisher","TV","Free parking","Outdoor grill","Lake","Fire pit","Exercise equipment","Piano"],"bookable":true,"shared_inventory_group":null,"review_notes":["Source base rate is a snapshot, not a date-specific quote. Preserve existing approved seasonal rate plans.","Guest split, cleaning fee and Airbnb ID are not verified by this public source."],"sort_order":1}'::jsonb, now()
FROM public.units u WHERE u.hostaway_listing_id = '318377'
ON CONFLICT (listing_id) DO UPDATE SET
  unit_id = EXCLUDED.unit_id,
  source = EXCLUDED.source,
  imported_at = now();

INSERT INTO public.hostaway_catalog (listing_id, unit_id, source, imported_at)
SELECT '318379', u.id, '{"name":"Getaway to the Red House","public_name":"Getaway to the Red House","description":"You won’t want to leave this charming, one-of-a-kind place. The bridges offers cabin rentals, serene views, and on-site amenities that include: free wifi, fully equipped gym, heated indoor pool, hot tub, sun deck, sauna, basketball court, pickleball court, racquetball, fire pit, charcoal grill, dining hall, rec room, coined laundry and more.","property_type":"Cabin","kind":"lodging_unit","max_guests":4,"max_adults":null,"max_children":null,"bedrooms":2,"beds":2,"bathrooms":1,"base_rate_cents":12999,"currency":"USD","house_rules":null,"amenities":["Swimming pool","Air conditioning","Pets allowed","Suitable for children","Internet","Wireless","Fireplace","Smoke detector","Carbon Monoxide Detector","First aid kit","Fire Extinguisher","TV","Free parking","Outdoor grill","Lake","Fire pit","Exercise equipment","Piano"],"bookable":true,"shared_inventory_group":null,"review_notes":["Source base rate is a snapshot, not a date-specific quote. Preserve existing approved seasonal rate plans.","Guest split, cleaning fee and Airbnb ID are not verified by this public source."],"sort_order":2}'::jsonb, now()
FROM public.units u WHERE u.hostaway_listing_id = '318379'
ON CONFLICT (listing_id) DO UPDATE SET
  unit_id = EXCLUDED.unit_id,
  source = EXCLUDED.source,
  imported_at = now();

INSERT INTO public.hostaway_catalog (listing_id, unit_id, source, imported_at)
SELECT '318381', u.id, '{"name":"Getaway at Crockett''s Lookout","public_name":"Getaway at Crockett''s Lookout","description":"You won’t want to leave this charming, one-of-a-kind place.  The bridges offers cabin rentals, serene views, and on-site amenities that include:  free wifi,  indoor pool, hot tub, sun deck, sauna, basketball court, fire pits, charcoal grill, dining hall, rec room, coined laundry and more.","property_type":"Hotel","kind":"lodging_unit","max_guests":4,"max_adults":null,"max_children":null,"bedrooms":1,"beds":3,"bathrooms":1,"base_rate_cents":14900,"currency":"USD","house_rules":null,"amenities":["Swimming pool","Air conditioning","Suitable for children","Internet","Wireless","Fireplace","Smoke detector","Carbon Monoxide Detector","First aid kit","Fire Extinguisher","TV","Free parking","Suitable for infants","Outdoor grill","Lake","Fire pit","Exercise equipment"],"bookable":true,"shared_inventory_group":null,"review_notes":["Source base rate is a snapshot, not a date-specific quote. Preserve existing approved seasonal rate plans.","Guest split, cleaning fee and Airbnb ID are not verified by this public source."],"sort_order":3}'::jsonb, now()
FROM public.units u WHERE u.hostaway_listing_id = '318381'
ON CONFLICT (listing_id) DO UPDATE SET
  unit_id = EXCLUDED.unit_id,
  source = EXCLUDED.source,
  imported_at = now();

INSERT INTO public.hostaway_catalog (listing_id, unit_id, source, imported_at)
SELECT '318380', u.id, '{"name":"Gateway to Nature''s beauty Rm 11","public_name":"Gateway to Nature''s beauty Rm 11","description":"You won’t want to leave this charming, one-of-a-kind place.  The bridges offers cabin rentals, serene views, and on-site amenities that include:  free wifi,  indoor pool, hot tub, sun deck, sauna, basketball court, fire pits, charcoal grill, dining hall, rec room, coined laundry and more.","property_type":"Hotel","kind":"lodging_unit","max_guests":3,"max_adults":null,"max_children":null,"bedrooms":1,"beds":2,"bathrooms":1,"base_rate_cents":12999,"currency":"USD","house_rules":null,"amenities":["Swimming pool","Air conditioning","Washing Machine","Suitable for children","Internet","Wireless","Fireplace","Smoke detector","Carbon Monoxide Detector","First aid kit","Fire Extinguisher","Laptop Friendly workspace","TV","Free parking","Suitable for infants","Outdoor grill","Fire pit","Exercise equipment"],"bookable":true,"shared_inventory_group":null,"review_notes":["Source base rate is a snapshot, not a date-specific quote. Preserve existing approved seasonal rate plans.","Guest split, cleaning fee and Airbnb ID are not verified by this public source."],"sort_order":4}'::jsonb, now()
FROM public.units u WHERE u.hostaway_listing_id = '318380'
ON CONFLICT (listing_id) DO UPDATE SET
  unit_id = EXCLUDED.unit_id,
  source = EXCLUDED.source,
  imported_at = now();

INSERT INTO public.hostaway_catalog (listing_id, unit_id, source, imported_at)
SELECT '318382', u.id, '{"name":"Gateway to Nature''s beauty Rm 12","public_name":"Gateway to Nature''s beauty Rm 12","description":"You won’t want to leave this charming, one-of-a-kind place.  The bridges offers cabin rentals, serene views, and on-site amenities that include:  free wifi,  indoor pool, hot tub, sun deck, sauna, basketball court, fire pits, charcoal grill, dining hall, rec room, coined laundry and more.","property_type":"Hotel","kind":"lodging_unit","max_guests":2,"max_adults":null,"max_children":null,"bedrooms":1,"beds":1,"bathrooms":1,"base_rate_cents":12999,"currency":"USD","house_rules":null,"amenities":["Swimming pool","Air conditioning","Washing Machine","Suitable for children","Internet","Wireless","Fireplace","Smoke detector","Carbon Monoxide Detector","First aid kit","Laptop Friendly workspace","TV","Free parking","Suitable for infants","Outdoor grill","Lake","Fire pit","Exercise equipment"],"bookable":true,"shared_inventory_group":null,"review_notes":["Source base rate is a snapshot, not a date-specific quote. Preserve existing approved seasonal rate plans.","Guest split, cleaning fee and Airbnb ID are not verified by this public source."],"sort_order":5}'::jsonb, now()
FROM public.units u WHERE u.hostaway_listing_id = '318382'
ON CONFLICT (listing_id) DO UPDATE SET
  unit_id = EXCLUDED.unit_id,
  source = EXCLUDED.source,
  imported_at = now();

INSERT INTO public.hostaway_catalog (listing_id, unit_id, source, imported_at)
SELECT '318383', u.id, '{"name":"Gateway to Nature''s Beauty Rm 15","public_name":"Gateway to Nature''s Beauty Rm 15","description":"You won’t want to leave this charming, one-of-a-kind place.  Get away from the daily hustle and bustle.  We offer cabin rentals, serene views, and on-site amenities.  Included is full access to indoor pool, hot tub, sun deck, sauna, basketball court, ping pong, fire pit, reading lounge, charcoal grills, dining hall, hiking trails, fishing, coined laundry, general store, and more.","property_type":"Hotel","kind":"lodging_unit","max_guests":2,"max_adults":null,"max_children":null,"bedrooms":1,"beds":1,"bathrooms":1,"base_rate_cents":12999,"currency":"USD","house_rules":null,"amenities":["Swimming pool","Air conditioning","Washing Machine","Suitable for children","Internet","Wireless","Fireplace","Smoke detector","Carbon Monoxide Detector","First aid kit","Fire Extinguisher","Laptop Friendly workspace","TV","Free parking","Outdoor grill","Lake","Fire pit","Exercise equipment"],"bookable":true,"shared_inventory_group":null,"review_notes":["Source base rate is a snapshot, not a date-specific quote. Preserve existing approved seasonal rate plans.","Guest split, cleaning fee and Airbnb ID are not verified by this public source."],"sort_order":6}'::jsonb, now()
FROM public.units u WHERE u.hostaway_listing_id = '318383'
ON CONFLICT (listing_id) DO UPDATE SET
  unit_id = EXCLUDED.unit_id,
  source = EXCLUDED.source,
  imported_at = now();

INSERT INTO public.hostaway_catalog (listing_id, unit_id, source, imported_at)
SELECT '318384', u.id, '{"name":"Serene Cedar''s Edge Room 1","public_name":"Serene Cedar''s Edge Room 1","description":"You won’t want to leave this charming, one-of-a-kind place.  The bridges offers cabin rentals, serene views, and on-site amenities that include:  free wifi,  indoor pool, hot tub, sun deck, sauna, basketball court, fire pits, charcoal grill, dining hall, rec room, coined laundry and more.","property_type":"Hotel","kind":"lodging_unit","max_guests":4,"max_adults":null,"max_children":null,"bedrooms":1,"beds":2,"bathrooms":1,"base_rate_cents":12999,"currency":"USD","house_rules":null,"amenities":["Swimming pool","Air conditioning","Suitable for children","Internet","Wireless","Fireplace","Smoke detector","Carbon Monoxide Detector","First aid kit","Fire Extinguisher","TV","Free parking","Suitable for infants","Outdoor grill","Lake","Fire pit","Exercise equipment"],"bookable":true,"shared_inventory_group":null,"review_notes":["Source base rate is a snapshot, not a date-specific quote. Preserve existing approved seasonal rate plans.","Guest split, cleaning fee and Airbnb ID are not verified by this public source."],"sort_order":7}'::jsonb, now()
FROM public.units u WHERE u.hostaway_listing_id = '318384'
ON CONFLICT (listing_id) DO UPDATE SET
  unit_id = EXCLUDED.unit_id,
  source = EXCLUDED.source,
  imported_at = now();

INSERT INTO public.hostaway_catalog (listing_id, unit_id, source, imported_at)
SELECT '318385', u.id, '{"name":"Gateway to Nature''s Room 14","public_name":"Gateway to Nature''s Room 14","description":"You won’t want to leave this charming, one-of-a-kind place.  The bridges offers cabin rentals, serene views, and on-site amenities that include:  free wifi,  indoor pool, hot tub, sun deck, sauna, basketball court, fire pits, charcoal grill, dining hall, rec room, coined laundry and more.","property_type":"Hotel","kind":"lodging_unit","max_guests":2,"max_adults":null,"max_children":null,"bedrooms":1,"beds":1,"bathrooms":1,"base_rate_cents":12999,"currency":"USD","house_rules":null,"amenities":["Swimming pool","Air conditioning","Washing Machine","Suitable for children","Internet","Wireless","Fireplace","Smoke detector","Carbon Monoxide Detector","First aid kit","Fire Extinguisher","Laptop Friendly workspace","TV","Free parking","Outdoor grill","Lake","Fire pit","Exercise equipment"],"bookable":true,"shared_inventory_group":null,"review_notes":["Source base rate is a snapshot, not a date-specific quote. Preserve existing approved seasonal rate plans.","Guest split, cleaning fee and Airbnb ID are not verified by this public source."],"sort_order":8}'::jsonb, now()
FROM public.units u WHERE u.hostaway_listing_id = '318385'
ON CONFLICT (listing_id) DO UPDATE SET
  unit_id = EXCLUDED.unit_id,
  source = EXCLUDED.source,
  imported_at = now();

INSERT INTO public.hostaway_catalog (listing_id, unit_id, source, imported_at)
SELECT '318386', u.id, '{"name":"Gateway to Nature''s Beauty Rm 16","public_name":"Gateway to Nature''s Beauty Rm 16","description":"You won’t want to leave this charming, one-of-a-kind place.  The bridges offers cabin rentals, serene views, and on-site amenities that include:  free wifi,  indoor pool, hot tub, sun deck, sauna, basketball court, fire pits, charcoal grill, dining hall, rec room, coined laundry and more.","property_type":"Hotel","kind":"lodging_unit","max_guests":2,"max_adults":null,"max_children":null,"bedrooms":1,"beds":1,"bathrooms":1,"base_rate_cents":12999,"currency":"USD","house_rules":null,"amenities":["Swimming pool","Air conditioning","Washing Machine","Suitable for children","Internet","Wireless","Fireplace","Smoke detector","Carbon Monoxide Detector","First aid kit","Fire Extinguisher","Laptop Friendly workspace","TV","Free parking","Suitable for infants","Outdoor grill","Lake","Fire pit","Exercise equipment"],"bookable":true,"shared_inventory_group":null,"review_notes":["Source base rate is a snapshot, not a date-specific quote. Preserve existing approved seasonal rate plans.","Guest split, cleaning fee and Airbnb ID are not verified by this public source."],"sort_order":9}'::jsonb, now()
FROM public.units u WHERE u.hostaway_listing_id = '318386'
ON CONFLICT (listing_id) DO UPDATE SET
  unit_id = EXCLUDED.unit_id,
  source = EXCLUDED.source,
  imported_at = now();

INSERT INTO public.hostaway_catalog (listing_id, unit_id, source, imported_at)
SELECT '318387', u.id, '{"name":"Creeks Bend Room 63","public_name":"Creeks Bend Room 63","description":"You won’t want to leave this charming, one-of-a-kind place.  The bridges offers cabin rentals, serene views, and on-site amenities that include:  free wifi,  indoor pool, hot tub, sun deck, sauna, basketball court, fire pits, charcoal grill, dining hall, rec room, coined laundry and more.","property_type":"Hotel","kind":"lodging_unit","max_guests":4,"max_adults":null,"max_children":null,"bedrooms":1,"beds":2,"bathrooms":1,"base_rate_cents":12999,"currency":"USD","house_rules":null,"amenities":["Swimming pool","Free WiFi","Air conditioning","Hot tub","Suitable for children","Internet","Wireless","Gym","Smoke detector","Carbon Monoxide Detector","First aid kit","Fire Extinguisher","Hangers","TV","Free parking","Balcony","Suitable for infants","Outdoor grill","Fitness center","Lake","Communal sauna","In person check-in","Fire pit","Exercise equipment","Ceiling fan"],"bookable":true,"shared_inventory_group":null,"review_notes":["Source base rate is a snapshot, not a date-specific quote. Preserve existing approved seasonal rate plans.","Guest split, cleaning fee and Airbnb ID are not verified by this public source."],"sort_order":10}'::jsonb, now()
FROM public.units u WHERE u.hostaway_listing_id = '318387'
ON CONFLICT (listing_id) DO UPDATE SET
  unit_id = EXCLUDED.unit_id,
  source = EXCLUDED.source,
  imported_at = now();

INSERT INTO public.hostaway_catalog (listing_id, unit_id, source, imported_at)
SELECT '318388', u.id, '{"name":"Serene Cedar''s Edge Room 2","public_name":"Serene Cedar''s Edge Room 2","description":"You won’t want to leave this charming, one-of-a-kind place.  The bridges offers cabin rentals, serene views, and on-site amenities that include:  free wifi,  indoor pool, hot tub, sun deck, sauna, basketball court, fire pits, charcoal grill, dining hall, rec room, coined laundry and more.","property_type":"Hotel","kind":"lodging_unit","max_guests":4,"max_adults":null,"max_children":null,"bedrooms":1,"beds":2,"bathrooms":1,"base_rate_cents":12999,"currency":"USD","house_rules":null,"amenities":["Swimming pool","Air conditioning","Suitable for children","Internet","Wireless","Fireplace","Smoke detector","Carbon Monoxide Detector","First aid kit","Fire Extinguisher","TV","Free parking","Outdoor grill","Lake","Fire pit","Exercise equipment"],"bookable":true,"shared_inventory_group":null,"review_notes":["Source base rate is a snapshot, not a date-specific quote. Preserve existing approved seasonal rate plans.","Guest split, cleaning fee and Airbnb ID are not verified by this public source."],"sort_order":11}'::jsonb, now()
FROM public.units u WHERE u.hostaway_listing_id = '318388'
ON CONFLICT (listing_id) DO UPDATE SET
  unit_id = EXCLUDED.unit_id,
  source = EXCLUDED.source,
  imported_at = now();

INSERT INTO public.hostaway_catalog (listing_id, unit_id, source, imported_at)
SELECT '318389', u.id, '{"name":"Creeks Bend Room 62","public_name":"Creeks Bend Room 62","description":"You won’t want to leave this charming, one-of-a-kind place.  The bridges offers cabin rentals, serene views, and on-site amenities that include:  free wifi,  indoor pool, hot tub, sun deck, sauna, basketball court, fire pits, charcoal grill, dining hall, rec room, coined laundry and more.","property_type":"Hotel","kind":"lodging_unit","max_guests":4,"max_adults":null,"max_children":null,"bedrooms":1,"beds":2,"bathrooms":1,"base_rate_cents":12999,"currency":"USD","house_rules":null,"amenities":["Swimming pool","Air conditioning","Suitable for children","Internet","Wireless","Fireplace","Smoke detector","Carbon Monoxide Detector","First aid kit","Fire Extinguisher","TV","Free parking","Outdoor grill","Lake","Fire pit","Exercise equipment"],"bookable":true,"shared_inventory_group":null,"review_notes":["Source base rate is a snapshot, not a date-specific quote. Preserve existing approved seasonal rate plans.","Guest split, cleaning fee and Airbnb ID are not verified by this public source."],"sort_order":12}'::jsonb, now()
FROM public.units u WHERE u.hostaway_listing_id = '318389'
ON CONFLICT (listing_id) DO UPDATE SET
  unit_id = EXCLUDED.unit_id,
  source = EXCLUDED.source,
  imported_at = now();

INSERT INTO public.hostaway_catalog (listing_id, unit_id, source, imported_at)
SELECT '318390', u.id, '{"name":"Creeks Bend Room 64","public_name":"Creeks Bend Room 64","description":"You won’t want to leave this charming, one-of-a-kind place.  The bridges offers cabin rentals, serene views, and on-site amenities that include:  free wifi,  indoor pool, hot tub, sun deck, sauna, basketball court, fire pits, charcoal grill, dining hall, rec room, coined laundry and more.","property_type":"Hotel","kind":"lodging_unit","max_guests":4,"max_adults":null,"max_children":null,"bedrooms":1,"beds":2,"bathrooms":1,"base_rate_cents":12999,"currency":"USD","house_rules":null,"amenities":["Swimming pool","Air conditioning","Suitable for children","Internet","Wireless","Fireplace","Smoke detector","Carbon Monoxide Detector","First aid kit","Fire Extinguisher","TV","Free parking","Suitable for infants","Outdoor grill","Lake","Fire pit","Exercise equipment"],"bookable":true,"shared_inventory_group":null,"review_notes":["Source base rate is a snapshot, not a date-specific quote. Preserve existing approved seasonal rate plans.","Guest split, cleaning fee and Airbnb ID are not verified by this public source."],"sort_order":13}'::jsonb, now()
FROM public.units u WHERE u.hostaway_listing_id = '318390'
ON CONFLICT (listing_id) DO UPDATE SET
  unit_id = EXCLUDED.unit_id,
  source = EXCLUDED.source,
  imported_at = now();

INSERT INTO public.hostaway_catalog (listing_id, unit_id, source, imported_at)
SELECT '318391', u.id, '{"name":"Serenity at Rock Retreat Rm 22","public_name":"Serenity at Rock Retreat Rm 22","description":"You won’t want to leave this charming, one-of-a-kind place.  The bridges offers cabin rentals, serene views, and on-site amenities that include:  free wifi,  indoor pool, hot tub, sun deck, sauna, basketball court, fire pits, charcoal grill, dining hall, rec room, coined laundry and more.","property_type":"Hotel","kind":"lodging_unit","max_guests":3,"max_adults":null,"max_children":null,"bedrooms":1,"beds":2,"bathrooms":1,"base_rate_cents":12999,"currency":"USD","house_rules":null,"amenities":["Swimming pool","Air conditioning","Washing Machine","Suitable for children","Internet","Wireless","Fireplace","Smoke detector","Carbon Monoxide Detector","First aid kit","Fire Extinguisher","Laptop Friendly workspace","TV","Free parking","Suitable for infants","Outdoor grill","Lake","Fire pit","Exercise equipment"],"bookable":true,"shared_inventory_group":null,"review_notes":["Source base rate is a snapshot, not a date-specific quote. Preserve existing approved seasonal rate plans.","Guest split, cleaning fee and Airbnb ID are not verified by this public source."],"sort_order":14}'::jsonb, now()
FROM public.units u WHERE u.hostaway_listing_id = '318391'
ON CONFLICT (listing_id) DO UPDATE SET
  unit_id = EXCLUDED.unit_id,
  source = EXCLUDED.source,
  imported_at = now();

INSERT INTO public.hostaway_catalog (listing_id, unit_id, source, imported_at)
SELECT '318392', u.id, '{"name":"Serenity at Rock Retreat Rm 21","public_name":"Serenity at Rock Retreat Rm 21","description":"You won’t want to leave this charming, one-of-a-kind place.  The bridges offers cabin rentals, serene views, and on-site amenities that include:  free wifi,  indoor pool, hot tub, sun deck, sauna, basketball court, fire pits, charcoal grill, dining hall, rec room, coined laundry and more.","property_type":"Hotel","kind":"lodging_unit","max_guests":3,"max_adults":null,"max_children":null,"bedrooms":1,"beds":2,"bathrooms":1,"base_rate_cents":12999,"currency":"USD","house_rules":null,"amenities":["Swimming pool","Air conditioning","Washing Machine","Suitable for children","Internet","Wireless","Fireplace","Smoke detector","Carbon Monoxide Detector","First aid kit","Fire Extinguisher","Laptop Friendly workspace","TV","Free parking","Suitable for infants","Outdoor grill","Lake","Fire pit","Exercise equipment"],"bookable":true,"shared_inventory_group":null,"review_notes":["Source base rate is a snapshot, not a date-specific quote. Preserve existing approved seasonal rate plans.","Guest split, cleaning fee and Airbnb ID are not verified by this public source."],"sort_order":15}'::jsonb, now()
FROM public.units u WHERE u.hostaway_listing_id = '318392'
ON CONFLICT (listing_id) DO UPDATE SET
  unit_id = EXCLUDED.unit_id,
  source = EXCLUDED.source,
  imported_at = now();

INSERT INTO public.hostaway_catalog (listing_id, unit_id, source, imported_at)
SELECT '318393', u.id, '{"name":"Creeks Bend Room 61","public_name":"Creeks Bend Room 61","description":"You won’t want to leave this charming, one-of-a-kind place.  The bridges offers cabin rentals, serene views, and on-site amenities that include:  free wifi,  indoor pool, hot tub, sun deck, sauna, basketball court, fire pits, charcoal grill, dining hall, rec room, coined laundry and more.","property_type":"Hotel","kind":"lodging_unit","max_guests":4,"max_adults":null,"max_children":null,"bedrooms":1,"beds":2,"bathrooms":1,"base_rate_cents":12999,"currency":"USD","house_rules":null,"amenities":["Swimming pool","Air conditioning","Suitable for children","Internet","Wireless","Fireplace","Smoke detector","Carbon Monoxide Detector","First aid kit","Fire Extinguisher","TV","Free parking","Outdoor grill","Lake","Fire pit","Exercise equipment"],"bookable":true,"shared_inventory_group":null,"review_notes":["Source base rate is a snapshot, not a date-specific quote. Preserve existing approved seasonal rate plans.","Guest split, cleaning fee and Airbnb ID are not verified by this public source."],"sort_order":16}'::jsonb, now()
FROM public.units u WHERE u.hostaway_listing_id = '318393'
ON CONFLICT (listing_id) DO UPDATE SET
  unit_id = EXCLUDED.unit_id,
  source = EXCLUDED.source,
  imported_at = now();

INSERT INTO public.hostaway_catalog (listing_id, unit_id, source, imported_at)
SELECT '318394', u.id, '{"name":"Hillside Haven 54","public_name":"Hillside Haven 54","description":"You won’t want to leave this charming, one-of-a-kind place.  The bridges offers cabin rentals, serene views, and on-site amenities that include:  free wifi,  indoor pool, hot tub, sun deck, sauna, basketball court, fire pits, charcoal grill, dining hall, rec room, coined laundry and more.","property_type":"Hotel","kind":"lodging_unit","max_guests":3,"max_adults":null,"max_children":null,"bedrooms":1,"beds":2,"bathrooms":1,"base_rate_cents":12999,"currency":"USD","house_rules":null,"amenities":["Swimming pool","Air conditioning","Suitable for children","Internet","Wireless","Fireplace","Smoke detector","Carbon Monoxide Detector","First aid kit","Fire Extinguisher","TV","Free parking","Outdoor grill","Lake","Fire pit","Exercise equipment"],"bookable":true,"shared_inventory_group":null,"review_notes":["Source base rate is a snapshot, not a date-specific quote. Preserve existing approved seasonal rate plans.","Guest split, cleaning fee and Airbnb ID are not verified by this public source."],"sort_order":17}'::jsonb, now()
FROM public.units u WHERE u.hostaway_listing_id = '318394'
ON CONFLICT (listing_id) DO UPDATE SET
  unit_id = EXCLUDED.unit_id,
  source = EXCLUDED.source,
  imported_at = now();

INSERT INTO public.hostaway_catalog (listing_id, unit_id, source, imported_at)
SELECT '318396', u.id, '{"name":"Hillside Haven 52","public_name":"Hillside Haven 52","description":"You won’t want to leave this charming, one-of-a-kind place.  The bridges offers cabin rentals, serene views, and on-site amenities that include:  free wifi,  indoor pool, hot tub, sun deck, sauna, basketball court, fire pits, charcoal grill, dining hall, rec room, coined laundry and more.","property_type":"Hotel","kind":"lodging_unit","max_guests":3,"max_adults":null,"max_children":null,"bedrooms":1,"beds":2,"bathrooms":1,"base_rate_cents":12999,"currency":"USD","house_rules":null,"amenities":["Swimming pool","Air conditioning","Suitable for children","Internet","Wireless","Fireplace","Smoke detector","Carbon Monoxide Detector","First aid kit","Fire Extinguisher","Laptop Friendly workspace","TV","Free parking","Outdoor grill","Lake","Fire pit","Exercise equipment"],"bookable":true,"shared_inventory_group":null,"review_notes":["Source base rate is a snapshot, not a date-specific quote. Preserve existing approved seasonal rate plans.","Guest split, cleaning fee and Airbnb ID are not verified by this public source."],"sort_order":18}'::jsonb, now()
FROM public.units u WHERE u.hostaway_listing_id = '318396'
ON CONFLICT (listing_id) DO UPDATE SET
  unit_id = EXCLUDED.unit_id,
  source = EXCLUDED.source,
  imported_at = now();

INSERT INTO public.hostaway_catalog (listing_id, unit_id, source, imported_at)
SELECT '318395', u.id, '{"name":"Serenity at Rock Retreat Room 23","public_name":"Serenity at Rock Retreat Room 23","description":"You won’t want to leave this charming, one-of-a-kind place.  The bridges offers cabin rentals, serene views, and on-site amenities that include:  free wifi,  indoor pool, hot tub, sun deck, sauna, basketball court, fire pits, charcoal grill, dining hall, rec room, coined laundry and more.","property_type":"Hotel","kind":"lodging_unit","max_guests":3,"max_adults":null,"max_children":null,"bedrooms":1,"beds":2,"bathrooms":1,"base_rate_cents":12999,"currency":"USD","house_rules":null,"amenities":["Swimming pool","Air conditioning","Washing Machine","Suitable for children","Internet","Wireless","Fireplace","Smoke detector","Carbon Monoxide Detector","First aid kit","Fire Extinguisher","Laptop Friendly workspace","TV","Free parking","Suitable for infants","Outdoor grill","Lake","Fire pit","Exercise equipment"],"bookable":true,"shared_inventory_group":null,"review_notes":["Source base rate is a snapshot, not a date-specific quote. Preserve existing approved seasonal rate plans.","Guest split, cleaning fee and Airbnb ID are not verified by this public source."],"sort_order":19}'::jsonb, now()
FROM public.units u WHERE u.hostaway_listing_id = '318395'
ON CONFLICT (listing_id) DO UPDATE SET
  unit_id = EXCLUDED.unit_id,
  source = EXCLUDED.source,
  imported_at = now();

INSERT INTO public.hostaway_catalog (listing_id, unit_id, source, imported_at)
SELECT '318397', u.id, '{"name":"Serenity at Rock Retreat Room 24","public_name":"Serenity at Rock Retreat Room 24","description":"You won’t want to leave this charming, one-of-a-kind place.  Get away from the hustle and bustle of everyday noise.   We offer cabin rentals, serene views, and on-site amenities.  We offer full access gym, indoor heated pool, sauna, fire pit, charcoal grills, basketball, racquetball, pickleball, dining hall, fishing, hiking, general store, and more.","property_type":"Hotel","kind":"lodging_unit","max_guests":3,"max_adults":null,"max_children":null,"bedrooms":1,"beds":2,"bathrooms":1,"base_rate_cents":12999,"currency":"USD","house_rules":null,"amenities":["Swimming pool","Air conditioning","Washing Machine","Suitable for children","Internet","Wireless","Fireplace","Smoke detector","Carbon Monoxide Detector","First aid kit","Fire Extinguisher","TV","Free parking","Suitable for infants","Outdoor grill","Pool table","Lake","Fire pit","Exercise equipment"],"bookable":true,"shared_inventory_group":null,"review_notes":["Source base rate is a snapshot, not a date-specific quote. Preserve existing approved seasonal rate plans.","Guest split, cleaning fee and Airbnb ID are not verified by this public source."],"sort_order":20}'::jsonb, now()
FROM public.units u WHERE u.hostaway_listing_id = '318397'
ON CONFLICT (listing_id) DO UPDATE SET
  unit_id = EXCLUDED.unit_id,
  source = EXCLUDED.source,
  imported_at = now();

INSERT INTO public.hostaway_catalog (listing_id, unit_id, source, imported_at)
SELECT '318398', u.id, '{"name":"Hillside Haven Room 51","public_name":"Hillside Haven Room 51","description":"You won’t want to leave this charming, one-of-a-kind place. The bridges offers cabin rentals, serene views, and on-site amenities that include: free wifi, fully equipped gym, heated indoor pool, hot tub, sun deck, sauna, basketball court, pickleball court, racquetball, fire pit, charcoal grill, dining hall, rec room, coined laundry and more.","property_type":"Hotel","kind":"lodging_unit","max_guests":3,"max_adults":null,"max_children":null,"bedrooms":1,"beds":2,"bathrooms":1,"base_rate_cents":12999,"currency":"USD","house_rules":null,"amenities":["Swimming pool","Air conditioning","Suitable for children","Internet","Wireless","Fireplace","Smoke detector","Carbon Monoxide Detector","First aid kit","Fire Extinguisher","Laptop Friendly workspace","TV","Free parking","Outdoor grill","Lake","Fire pit","Exercise equipment"],"bookable":true,"shared_inventory_group":null,"review_notes":["Source base rate is a snapshot, not a date-specific quote. Preserve existing approved seasonal rate plans.","Guest split, cleaning fee and Airbnb ID are not verified by this public source."],"sort_order":21}'::jsonb, now()
FROM public.units u WHERE u.hostaway_listing_id = '318398'
ON CONFLICT (listing_id) DO UPDATE SET
  unit_id = EXCLUDED.unit_id,
  source = EXCLUDED.source,
  imported_at = now();

INSERT INTO public.hostaway_catalog (listing_id, unit_id, source, imported_at)
SELECT '318399', u.id, '{"name":"Frontier Hideaway Room 31","public_name":"Frontier Hideaway Room 31","description":"You won’t want to leave this charming, one-of-a-kind place.  Get away from the hustle and bustle of all the noise in everyday life where there is the only double span natural bridges.  We offer cabin rental, serene views, and on-site amenities.  We have full access to a gym, sauna, indoor heated pool, basketball, racquetball, pickleball, charcoal grills, fire pits, hiking, fishing, dining hall, general store, and much more.","property_type":"Hotel","kind":"lodging_unit","max_guests":3,"max_adults":null,"max_children":null,"bedrooms":1,"beds":2,"bathrooms":1,"base_rate_cents":12999,"currency":"USD","house_rules":null,"amenities":["Swimming pool","Air conditioning","Washing Machine","Suitable for children","Internet","Wireless","Fireplace","Smoke detector","Carbon Monoxide Detector","First aid kit","Fire Extinguisher","TV","Free parking","Suitable for infants","Outdoor grill","Lake","Fire pit","Exercise equipment"],"bookable":true,"shared_inventory_group":null,"review_notes":["Source base rate is a snapshot, not a date-specific quote. Preserve existing approved seasonal rate plans.","Guest split, cleaning fee and Airbnb ID are not verified by this public source."],"sort_order":22}'::jsonb, now()
FROM public.units u WHERE u.hostaway_listing_id = '318399'
ON CONFLICT (listing_id) DO UPDATE SET
  unit_id = EXCLUDED.unit_id,
  source = EXCLUDED.source,
  imported_at = now();

INSERT INTO public.hostaway_catalog (listing_id, unit_id, source, imported_at)
SELECT '318400', u.id, '{"name":"Hillside Haven 53","public_name":"Hillside Haven 53","description":"You won’t want to leave this charming, one-of-a-kind place. The bridges offers cabin rentals, serene views, and on-site amenities that include: free wifi, fully equipped gym, heated indoor pool, hot tub, sun deck, sauna, basketball court, pickleball court, racquetball, fire pit, charcoal grill, dining hall, rec room, coined laundry and more.","property_type":"Hotel","kind":"lodging_unit","max_guests":3,"max_adults":null,"max_children":null,"bedrooms":1,"beds":2,"bathrooms":1,"base_rate_cents":12999,"currency":"USD","house_rules":null,"amenities":["Swimming pool","Air conditioning","Suitable for children","Internet","Wireless","Fireplace","Smoke detector","Carbon Monoxide Detector","First aid kit","Fire Extinguisher","Laptop Friendly workspace","TV","Free parking","Outdoor grill","Lake","Fire pit","Exercise equipment"],"bookable":true,"shared_inventory_group":null,"review_notes":["Source base rate is a snapshot, not a date-specific quote. Preserve existing approved seasonal rate plans.","Guest split, cleaning fee and Airbnb ID are not verified by this public source."],"sort_order":23}'::jsonb, now()
FROM public.units u WHERE u.hostaway_listing_id = '318400'
ON CONFLICT (listing_id) DO UPDATE SET
  unit_id = EXCLUDED.unit_id,
  source = EXCLUDED.source,
  imported_at = now();

INSERT INTO public.hostaway_catalog (listing_id, unit_id, source, imported_at)
SELECT '318401', u.id, '{"name":"Owls Nest 44","public_name":"Owls Nest 44","description":"You won’t want to leave this charming, one-of-a-kind place. The bridges offers cabin rentals, serene views, and on-site amenities that include: free wifi, fully equipped gym, heated indoor pool, hot tub, sun deck, sauna, basketball court, pickleball court, racquetball, fire pit, charcoal grill, dining hall, rec room, coined laundry and more.","property_type":"Hotel","kind":"lodging_unit","max_guests":3,"max_adults":null,"max_children":null,"bedrooms":1,"beds":2,"bathrooms":1,"base_rate_cents":12999,"currency":"USD","house_rules":null,"amenities":["Swimming pool","Air conditioning","Suitable for children","Internet","Wireless","Fireplace","Smoke detector","Carbon Monoxide Detector","First aid kit","Fire Extinguisher","Laptop Friendly workspace","TV","Free parking","Outdoor grill","Lake","Fire pit","Exercise equipment"],"bookable":true,"shared_inventory_group":null,"review_notes":["Source base rate is a snapshot, not a date-specific quote. Preserve existing approved seasonal rate plans.","Guest split, cleaning fee and Airbnb ID are not verified by this public source."],"sort_order":24}'::jsonb, now()
FROM public.units u WHERE u.hostaway_listing_id = '318401'
ON CONFLICT (listing_id) DO UPDATE SET
  unit_id = EXCLUDED.unit_id,
  source = EXCLUDED.source,
  imported_at = now();

INSERT INTO public.hostaway_catalog (listing_id, unit_id, source, imported_at)
SELECT '318402', u.id, '{"name":"Frontier Hideaway Room 33","public_name":"Frontier Hideaway Room 33","description":"You won’t want to leave this charming, one-of-a-kind place.  Get away from the hustle and bustle of everyday noise at the only double span natural bridges.  We offer cabin rentals, serene views, and on-site amenities.  We have full access gym, indoor heated pool, sauna, fire pit, charcoal grills, hiking, fishing, basketball, pickleball, coined laundry, dining hall, reading lounge, ping pong, general store, and many more.","property_type":"Hotel","kind":"lodging_unit","max_guests":3,"max_adults":null,"max_children":null,"bedrooms":1,"beds":2,"bathrooms":1,"base_rate_cents":12999,"currency":"USD","house_rules":null,"amenities":["Swimming pool","Air conditioning","Washing Machine","Suitable for children","Internet","Wireless","Fireplace","Smoke detector","Carbon Monoxide Detector","First aid kit","Fire Extinguisher","Laptop Friendly workspace","TV","Free parking","Suitable for infants","Outdoor grill","Lake","Fire pit","Exercise equipment"],"bookable":true,"shared_inventory_group":null,"review_notes":["Source base rate is a snapshot, not a date-specific quote. Preserve existing approved seasonal rate plans.","Guest split, cleaning fee and Airbnb ID are not verified by this public source."],"sort_order":25}'::jsonb, now()
FROM public.units u WHERE u.hostaway_listing_id = '318402'
ON CONFLICT (listing_id) DO UPDATE SET
  unit_id = EXCLUDED.unit_id,
  source = EXCLUDED.source,
  imported_at = now();

INSERT INTO public.hostaway_catalog (listing_id, unit_id, source, imported_at)
SELECT '318403', u.id, '{"name":"Frontier Hideaway Room 32","public_name":"Frontier Hideaway Room 32","description":"You won’t want to leave this charming, one-of-a-kind place.  Get away from the hustle and bustle of everyday noise at the natural bridges with the only double span natural bridges in the world.  We offer cabin rentals, serene views, and on-site amenities.  We also offer full access to a gym, indoor heated pool, sauna, racquetball, pickleball, fire pits, charcoal grills, hiking, fishing, basketball, coined laundry, dining hall, a general store and much more.","property_type":"Hotel","kind":"lodging_unit","max_guests":3,"max_adults":null,"max_children":null,"bedrooms":1,"beds":2,"bathrooms":1,"base_rate_cents":12999,"currency":"USD","house_rules":null,"amenities":["Swimming pool","Air conditioning","Washing Machine","Suitable for children","Internet","Wireless","Fireplace","Smoke detector","Carbon Monoxide Detector","First aid kit","Fire Extinguisher","Laptop Friendly workspace","TV","Free parking","Outdoor grill","Lake","Fire pit","Exercise equipment"],"bookable":true,"shared_inventory_group":null,"review_notes":["Source base rate is a snapshot, not a date-specific quote. Preserve existing approved seasonal rate plans.","Guest split, cleaning fee and Airbnb ID are not verified by this public source."],"sort_order":26}'::jsonb, now()
FROM public.units u WHERE u.hostaway_listing_id = '318403'
ON CONFLICT (listing_id) DO UPDATE SET
  unit_id = EXCLUDED.unit_id,
  source = EXCLUDED.source,
  imported_at = now();

INSERT INTO public.hostaway_catalog (listing_id, unit_id, source, imported_at)
SELECT '318404', u.id, '{"name":"Owls Nest 43","public_name":"Owls Nest 43","description":"You won’t want to leave this charming, one-of-a-kind place. The bridges offers cabin rentals, serene views, and on-site amenities that include: free wifi, fully equipped gym, heated indoor pool, hot tub, sun deck, sauna, basketball court, pickleball court, racquetball, fire pit, charcoal grill, dining hall, rec room, coined laundry and more.","property_type":"Hotel","kind":"lodging_unit","max_guests":3,"max_adults":null,"max_children":null,"bedrooms":1,"beds":2,"bathrooms":1,"base_rate_cents":12999,"currency":"USD","house_rules":null,"amenities":["Swimming pool","Air conditioning","Suitable for children","Internet","Wireless","Fireplace","Smoke detector","Carbon Monoxide Detector","First aid kit","Fire Extinguisher","Laptop Friendly workspace","TV","Free parking","Outdoor grill","Lake","Fire pit","Exercise equipment"],"bookable":true,"shared_inventory_group":null,"review_notes":["Source base rate is a snapshot, not a date-specific quote. Preserve existing approved seasonal rate plans.","Guest split, cleaning fee and Airbnb ID are not verified by this public source."],"sort_order":27}'::jsonb, now()
FROM public.units u WHERE u.hostaway_listing_id = '318404'
ON CONFLICT (listing_id) DO UPDATE SET
  unit_id = EXCLUDED.unit_id,
  source = EXCLUDED.source,
  imported_at = now();

INSERT INTO public.hostaway_catalog (listing_id, unit_id, source, imported_at)
SELECT '318405', u.id, '{"name":"Owls Nest Room 42","public_name":"Owls Nest Room 42","description":"You won’t want to leave this charming, one-of-a-kind place. The bridges offers cabin rentals, serene views, and on-site amenities that include: free wifi, fully equipped gym, heated indoor pool, hot tub, sun deck, sauna, basketball court, pickleball court, racquetball, fire pit, charcoal grill, dining hall, rec room, coined laundry and more.","property_type":"Hotel","kind":"lodging_unit","max_guests":3,"max_adults":null,"max_children":null,"bedrooms":1,"beds":2,"bathrooms":1,"base_rate_cents":12999,"currency":"USD","house_rules":null,"amenities":["Swimming pool","Air conditioning","Washing Machine","Suitable for children","Internet","Wireless","Fireplace","Smoke detector","Carbon Monoxide Detector","First aid kit","Fire Extinguisher","Laptop Friendly workspace","TV","Free parking","Outdoor grill","Lake","Exercise equipment"],"bookable":true,"shared_inventory_group":null,"review_notes":["Source base rate is a snapshot, not a date-specific quote. Preserve existing approved seasonal rate plans.","Guest split, cleaning fee and Airbnb ID are not verified by this public source."],"sort_order":28}'::jsonb, now()
FROM public.units u WHERE u.hostaway_listing_id = '318405'
ON CONFLICT (listing_id) DO UPDATE SET
  unit_id = EXCLUDED.unit_id,
  source = EXCLUDED.source,
  imported_at = now();

INSERT INTO public.hostaway_catalog (listing_id, unit_id, source, imported_at)
SELECT '318406', u.id, '{"name":"Owls Nest Room 41","public_name":"Owls Nest Room 41","description":"You won’t want to leave this charming, one-of-a-kind place. The bridges offers cabin rentals, serene views, and on-site amenities that include: free wifi, fully equipped gym, heated indoor pool, hot tub, sun deck, sauna, basketball court, pickleball court, racquetball, fire pit, charcoal grill, dining hall, rec room, coined laundry and more.","property_type":"Hotel","kind":"lodging_unit","max_guests":3,"max_adults":null,"max_children":null,"bedrooms":1,"beds":2,"bathrooms":1,"base_rate_cents":12999,"currency":"USD","house_rules":null,"amenities":["Swimming pool","Air conditioning","Washing Machine","Suitable for children","Internet","Wireless","Fireplace","Smoke detector","Carbon Monoxide Detector","First aid kit","Fire Extinguisher","Laptop Friendly workspace","TV","Free parking","Outdoor grill","Lake","Fire pit","Exercise equipment"],"bookable":true,"shared_inventory_group":null,"review_notes":["Source base rate is a snapshot, not a date-specific quote. Preserve existing approved seasonal rate plans.","Guest split, cleaning fee and Airbnb ID are not verified by this public source."],"sort_order":29}'::jsonb, now()
FROM public.units u WHERE u.hostaway_listing_id = '318406'
ON CONFLICT (listing_id) DO UPDATE SET
  unit_id = EXCLUDED.unit_id,
  source = EXCLUDED.source,
  imported_at = now();

INSERT INTO public.hostaway_catalog (listing_id, unit_id, source, imported_at)
SELECT '318407', u.id, '{"name":"Frontier Hideaway Room 34","public_name":"Frontier Hideaway Room 34","description":"You won’t want to leave this charming, one-of-a-kind place.  Get away from the hustle and bustle to the only natural double span bridges in the world.  We offer cabins, serene views, and on-site amenities, and much more.","property_type":"Hotel","kind":"lodging_unit","max_guests":3,"max_adults":null,"max_children":null,"bedrooms":1,"beds":2,"bathrooms":1,"base_rate_cents":12999,"currency":"USD","house_rules":null,"amenities":["Swimming pool","Air conditioning","Washing Machine","Suitable for children","Internet","Wireless","Fireplace","Smoke detector","Carbon Monoxide Detector","First aid kit","Fire Extinguisher","Laptop Friendly workspace","TV","Free parking","Outdoor grill","Lake","Fire pit","Exercise equipment"],"bookable":true,"shared_inventory_group":null,"review_notes":["Source base rate is a snapshot, not a date-specific quote. Preserve existing approved seasonal rate plans.","Guest split, cleaning fee and Airbnb ID are not verified by this public source."],"sort_order":30}'::jsonb, now()
FROM public.units u WHERE u.hostaway_listing_id = '318407'
ON CONFLICT (listing_id) DO UPDATE SET
  unit_id = EXCLUDED.unit_id,
  source = EXCLUDED.source,
  imported_at = now();

INSERT INTO public.hostaway_catalog (listing_id, unit_id, source, imported_at)
SELECT '347720', u.id, '{"name":"Jessie''s Hideaway","public_name":"Jessie''s Hideaway","description":"You won’t want to leave this charming, one-of-a-kind place.  Get away from the hustle and bustle of all the noise in everyday life where there is the only double span natural bridges.  We offer cabin rental, serene views, and on-site amenities.  We have full access to a gym, sauna, indoor heated pool, basketball, racquetball, pickleball, charcoal grills, fire pits, hiking, fishing, dining hall, general store, and much more.","property_type":"Cabin","kind":"lodging_unit","max_guests":2,"max_adults":null,"max_children":null,"bedrooms":1,"beds":1,"bathrooms":1,"base_rate_cents":12500,"currency":"USD","house_rules":null,"amenities":["Free WiFi","Air conditioning","Pets allowed","Suitable for children","Internet","Wireless","Hair Dryer","Heating","Smoke detector","Carbon Monoxide Detector","First aid kit","Fire Extinguisher","TV","Free parking","Suitable for infants","Communal swimming pool","Outdoor grill","Microwave","Oven","Shower","Stove","Coin laundry","Ping pong table","Lake","Family","Historic","Romantic","Contactless Check-In/Out","Communal sauna","Fire pit","Exercise equipment","Ceiling fan","Mini fridge"],"bookable":true,"shared_inventory_group":null,"review_notes":["Source base rate is a snapshot, not a date-specific quote. Preserve existing approved seasonal rate plans.","Guest split, cleaning fee and Airbnb ID are not verified by this public source."],"sort_order":31}'::jsonb, now()
FROM public.units u WHERE u.hostaway_listing_id = '347720'
ON CONFLICT (listing_id) DO UPDATE SET
  unit_id = EXCLUDED.unit_id,
  source = EXCLUDED.source,
  imported_at = now();

INSERT INTO public.hostaway_catalog (listing_id, unit_id, source, imported_at)
SELECT '347721', u.id, '{"name":"Frank''s Retreat","public_name":"Frank''s Retreat","description":"You won’t want to leave this charming, one-of-a-kind place. Get away from the hustle and bustle of all the noise in everyday life where there is the only double span natural bridges.  We offer cabin rental, serene views, and on-site amenities.  We have full access to a gym, sauna, indoor heated pool, basketball, racquetball, pickleball, charcoal grills, fire pits, hiking, fishing, dining hall, general store, and much more.","property_type":"Cabin","kind":"lodging_unit","max_guests":4,"max_adults":null,"max_children":null,"bedrooms":2,"beds":2,"bathrooms":2,"base_rate_cents":20000,"currency":"USD","house_rules":null,"amenities":["Swimming pool","Kitchen","Air conditioning","Washing Machine","Pets allowed","Suitable for children","Internet","Wireless","Fireplace","Smoke detector","Carbon Monoxide Detector","First aid kit","Fire Extinguisher","TV","Free parking","Suitable for infants","Outdoor grill","Lake","Fire pit","Exercise equipment"],"bookable":true,"shared_inventory_group":null,"review_notes":["Source base rate is a snapshot, not a date-specific quote. Preserve existing approved seasonal rate plans.","Guest split, cleaning fee and Airbnb ID are not verified by this public source."],"sort_order":32}'::jsonb, now()
FROM public.units u WHERE u.hostaway_listing_id = '347721'
ON CONFLICT (listing_id) DO UPDATE SET
  unit_id = EXCLUDED.unit_id,
  source = EXCLUDED.source,
  imported_at = now();

INSERT INTO public.hostaway_catalog (listing_id, unit_id, source, imported_at)
SELECT '416928', u.id, '{"name":"RV Park (Pet Friendly): Basic Package","public_name":"RV Park (Pet Friendly): Basic Package","description":"Enjoy the beauty of nature without sacrificing comfort at The Bridges in Waynesboro, TN. Our 6 spacious, pet-friendly RV sites come with full hookups—water, sewer, and electric—and are available for both short-term getaways and long-term stays. **RV NOT INCLUDED**\n\nWhether you’re just passing through or looking for an extended escape, we offer the flexibility you need in a peaceful, resort-style setting.\n\nOur Basic RV Park Package gives you access to hookup. Our Deluxe Package gives you hookup PLUS full access to our amenities.","property_type":"Camper/RV","kind":"rv_package_offer","max_guests":10,"max_adults":null,"max_children":null,"bedrooms":null,"beds":null,"bathrooms":null,"base_rate_cents":5000,"currency":"USD","house_rules":null,"amenities":["Free WiFi","Pets allowed","Suitable for children","Internet","Wireless","Free parking","Suitable for events","Suitable for infants","Long term stays allowed"],"bookable":true,"shared_inventory_group":"bridges-rv-sites","review_notes":["Basic and Deluxe describe the same six-site RV park; these offers are NOT two independent RV sites. Preserve both listing records; require shared/site-level allocation before enabling direct booking.","The person capacity is people, not the number of RV sites.","Source base rate is a snapshot, not a date-specific quote. Preserve existing approved seasonal rate plans.","Guest split, cleaning fee and Airbnb ID are not verified by this public source."],"sort_order":33}'::jsonb, now()
FROM public.units u WHERE u.hostaway_listing_id = '416928'
ON CONFLICT (listing_id) DO UPDATE SET
  unit_id = EXCLUDED.unit_id,
  source = EXCLUDED.source,
  imported_at = now();

INSERT INTO public.hostaway_catalog (listing_id, unit_id, source, imported_at)
SELECT '416933', u.id, '{"name":"RV Park (Pet Friendly): Deluxe Package","public_name":"RV Park (Pet Friendly): Deluxe Package","description":"Enjoy the beauty of nature without sacrificing comfort at The Bridges in Waynesboro, TN. Our 6 spacious, pet-friendly RV sites come with full hookups—water, sewer, and electric—and are available for both short-term getaways and long-term stays.  **RV NOT INCLUDED**\n\nWhether you’re just passing through or looking for an extended escape, we offer the flexibility you need in a peaceful, resort-style setting.\n\n$50/night - includes hookup\n$75/night – Includes hookup, full access to the resort, including hiking trails, pool, sauna, and more!\n\nCome for a night or stay awhile—your RV adventure starts here at The Bridges.","property_type":"Camper/RV","kind":"rv_package_offer","max_guests":8,"max_adults":null,"max_children":null,"bedrooms":null,"beds":null,"bathrooms":null,"base_rate_cents":7500,"currency":"USD","house_rules":null,"amenities":["Swimming pool","Free WiFi","Pets allowed","Suitable for children","Internet","Wireless","Gym","Free parking","Suitable for infants","Communal swimming pool","Heated swimming pool","Outdoor grill","Hot water","Game room","Sauna","Long term stays allowed","Indoor pool","Breakfast possible","Fishing","Swimming","Tubing water","Family","Historic","Romantic","Contactless Check-In/Out","Meal delivery","Outdoor firepit"],"bookable":true,"shared_inventory_group":"bridges-rv-sites","review_notes":["Basic and Deluxe describe the same six-site RV park; these offers are NOT two independent RV sites. Preserve both listing records; require shared/site-level allocation before enabling direct booking.","The person capacity is people, not the number of RV sites.","Source base rate is a snapshot, not a date-specific quote. Preserve existing approved seasonal rate plans.","Guest split, cleaning fee and Airbnb ID are not verified by this public source."],"sort_order":34}'::jsonb, now()
FROM public.units u WHERE u.hostaway_listing_id = '416933'
ON CONFLICT (listing_id) DO UPDATE SET
  unit_id = EXCLUDED.unit_id,
  source = EXCLUDED.source,
  imported_at = now();