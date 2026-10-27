-- Add primary_image_url to units if not exists
ALTER TABLE public.units ADD COLUMN IF NOT EXISTS primary_image_url text;

-- Update existing ROOM-01 with Airbnb details
UPDATE public.units
SET
  public_name = 'Serene Cedar''s Edge Room 1',
  unit_kind = 'room',
  airbnb_listing_id = '1268148035432490604',
  airbnb_url = 'https://www.airbnb.com/rooms/1268148035432490604',
  primary_image_url = 'https://a0.muscache.com/im/pictures/prohost-api/Hosting-1268148035432490604/original/bde00d85-55a4-4c24-9478-2668d1cec6a4.jpeg?aki_policy=large',
  is_published = true,
  ical_sync_status = 'unverified'
WHERE unit_code = 'ROOM-01';

-- Update ROOM-11
UPDATE public.units
SET
  public_name = 'Gateway to Nature''s beauty Rm 11',
  unit_kind = 'room',
  airbnb_listing_id = '1267441178635327527',
  airbnb_url = 'https://www.airbnb.com/rooms/1267441178635327527',
  primary_image_url = 'https://a0.muscache.com/im/pictures/prohost-api/Hosting-1267441178635327527/original/1089c99e-9c36-4420-99c2-980959c9cf67.jpeg?aki_policy=large',
  is_published = true,
  ical_sync_status = 'unverified'
WHERE unit_code = 'ROOM-11';

-- Update ROOM-12
UPDATE public.units
SET
  public_name = 'Gateway to Nature''s beauty Rm 12',
  unit_kind = 'room',
  airbnb_listing_id = 'airbnb-rm-12',
  airbnb_url = 'https://www.airbnb.com/users/show/244417704',
  is_published = true,
  ical_sync_status = 'unverified'
WHERE unit_code = 'ROOM-12';

-- Update ROOM-24
UPDATE public.units
SET
  public_name = 'Serenity at Rock Retreat Room 24',
  unit_kind = 'room',
  airbnb_listing_id = 'airbnb-rm-24',
  airbnb_url = 'https://www.airbnb.com/users/show/244417704',
  is_published = true,
  ical_sync_status = 'unverified'
WHERE unit_code = 'ROOM-24';

-- Update ROOM-31
UPDATE public.units
SET
  public_name = 'Frontier Hideaway Room 31',
  unit_kind = 'room',
  airbnb_listing_id = 'airbnb-rm-31',
  airbnb_url = 'https://www.airbnb.com/users/show/244417704',
  is_published = true,
  ical_sync_status = 'unverified'
WHERE unit_code = 'ROOM-31';

-- Insert or update Jessie's Hideaway (Cabin)
INSERT INTO public.units (
  unit_code,
  public_name,
  unit_kind,
  description,
  max_guests,
  max_adults,
  max_children,
  bedrooms,
  beds,
  bathrooms,
  base_rate_cents,
  cleaning_fee_cents,
  airbnb_listing_id,
  airbnb_url,
  primary_image_url,
  is_published,
  ical_sync_status
)
VALUES (
  'CABIN-JESSIE',
  'Jessie''s Hideaway',
  'cabin',
  'A peaceful, secluded cabin hideaway at The Bridges in Waynesboro, TN. Pet-friendly with pristine outdoor space.',
  4,
  4,
  2,
  1,
  2,
  1.0,
  14900,
  5000,
  '1309383340152249544',
  'https://www.airbnb.com/rooms/1309383340152249544',
  'https://a0.muscache.com/im/pictures/miso/Hosting-1309383340152249544/original/5bed1629-1134-4d49-bcec-01928b161791.jpeg?aki_policy=large',
  true,
  'unverified'
)
ON CONFLICT (unit_code) DO UPDATE SET
  public_name = EXCLUDED.public_name,
  airbnb_listing_id = EXCLUDED.airbnb_listing_id,
  airbnb_url = EXCLUDED.airbnb_url,
  primary_image_url = EXCLUDED.primary_image_url,
  is_published = true;

-- Insert or update Frank's Retreat (Cabin)
INSERT INTO public.units (
  unit_code,
  public_name,
  unit_kind,
  description,
  max_guests,
  max_adults,
  max_children,
  bedrooms,
  beds,
  bathrooms,
  base_rate_cents,
  cleaning_fee_cents,
  airbnb_listing_id,
  airbnb_url,
  primary_image_url,
  is_published,
  ical_sync_status
)
VALUES (
  'CABIN-FRANK',
  'Frank''s Retreat',
  'cabin',
  'A cozy wood cabin retreat tucked into the woods at The Bridges in Waynesboro, TN.',
  4,
  4,
  2,
  1,
  2,
  1.0,
  14900,
  5000,
  '1309595693133521444',
  'https://www.airbnb.com/rooms/1309595693133521444',
  'https://a0.muscache.com/im/pictures/miso/Hosting-1309595693133521444/original/be195837-9162-4d99-bf47-adad28e4bd80.jpeg?aki_policy=large',
  true,
  'unverified'
)
ON CONFLICT (unit_code) DO UPDATE SET
  public_name = EXCLUDED.public_name,
  airbnb_listing_id = EXCLUDED.airbnb_listing_id,
  airbnb_url = EXCLUDED.airbnb_url,
  primary_image_url = EXCLUDED.primary_image_url,
  is_published = true;

-- Insert or update Owls Nest Room 42
INSERT INTO public.units (
  unit_code,
  public_name,
  unit_kind,
  description,
  max_guests,
  max_adults,
  max_children,
  bedrooms,
  beds,
  bathrooms,
  base_rate_cents,
  cleaning_fee_cents,
  airbnb_listing_id,
  airbnb_url,
  is_published,
  ical_sync_status
)
VALUES (
  'ROOM-42',
  'Owls Nest Room 42',
  'room',
  'Comfortable lodge room in the Owls Nest section of The Bridges.',
  2,
  2,
  1,
  1,
  1,
  1.0,
  9900,
  0,
  'airbnb-rm-42',
  'https://www.airbnb.com/users/show/244417704',
  true,
  'unverified'
)
ON CONFLICT (unit_code) DO UPDATE SET
  public_name = EXCLUDED.public_name,
  airbnb_listing_id = EXCLUDED.airbnb_listing_id,
  is_published = true;

-- Insert or update Owls Nest Room 44
INSERT INTO public.units (
  unit_code,
  public_name,
  unit_kind,
  description,
  max_guests,
  max_adults,
  max_children,
  bedrooms,
  beds,
  bathrooms,
  base_rate_cents,
  cleaning_fee_cents,
  airbnb_listing_id,
  airbnb_url,
  primary_image_url,
  is_published,
  ical_sync_status
)
VALUES (
  'ROOM-44',
  'Owls Nest Room 44',
  'room',
  'Comfortable lodge room in the Owls Nest section of The Bridges.',
  2,
  2,
  1,
  1,
  1,
  1.0,
  9900,
  0,
  '1268247504470492270',
  'https://www.airbnb.com/rooms/1268247504470492270',
  'https://a0.muscache.com/im/pictures/prohost-api/Hosting-1268247504470492270/original/88e2fc6c-ccc7-4a38-bd64-a5942a384317.jpeg?aki_policy=large',
  true,
  'unverified'
)
ON CONFLICT (unit_code) DO UPDATE SET
  public_name = EXCLUDED.public_name,
  airbnb_listing_id = EXCLUDED.airbnb_listing_id,
  primary_image_url = EXCLUDED.primary_image_url,
  is_published = true;

-- Insert or update Hillside Haven Room 51
INSERT INTO public.units (
  unit_code,
  public_name,
  unit_kind,
  description,
  max_guests,
  max_adults,
  max_children,
  bedrooms,
  beds,
  bathrooms,
  base_rate_cents,
  cleaning_fee_cents,
  airbnb_listing_id,
  airbnb_url,
  primary_image_url,
  is_published,
  ical_sync_status
)
VALUES (
  'ROOM-51',
  'Hillside Haven Room 51',
  'room',
  'Relaxing lodge room in the Hillside Haven section of The Bridges.',
  2,
  2,
  1,
  1,
  1,
  1.0,
  9900,
  0,
  '1268242762366408975',
  'https://www.airbnb.com/rooms/1268242762366408975',
  'https://a0.muscache.com/im/pictures/prohost-api/Hosting-1268242762366408975/original/be0f1a55-409c-48ed-8927-93b7484c9ac7.jpeg?aki_policy=large',
  true,
  'unverified'
)
ON CONFLICT (unit_code) DO UPDATE SET
  public_name = EXCLUDED.public_name,
  airbnb_listing_id = EXCLUDED.airbnb_listing_id,
  primary_image_url = EXCLUDED.primary_image_url,
  is_published = true;