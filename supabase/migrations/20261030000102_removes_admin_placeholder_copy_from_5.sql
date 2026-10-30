-- 1. Replace admin placeholder copy with concise guest-facing descriptions
UPDATE units
SET description = 'A comfortable guest room at The Bridges in Waynesboro, TN.'
WHERE is_published = true
  AND description = 'Guest room at The Bridges. Adjust capacity, amenities, rate, and photos in the admin.';

-- 2. Standardize Room 11 & 12 names (remove "Rm", fix capitalization)
UPDATE units
SET public_name = 'Gateway to Nature''s Beauty — Room 11'
WHERE unit_code = 'ROOM-11';

UPDATE units
SET public_name = 'Gateway to Nature''s Beauty — Room 12'
WHERE unit_code = 'ROOM-12';

-- 3. Add primary photos for the 5 named cabin/room accommodations using durable project media.
-- Frank's Retreat (cabin) -> facilities27 (cabins & facilities)
INSERT INTO unit_media (unit_id, image_url, alt_text, is_primary, sort_order, storage_path)
SELECT u.id, 'https://vibe.filesafe.space/1790196628861484830/assets/b8fc567d-a74f-475f-a864-1e55446e5777.jpg', 'Frank''s Retreat cabin at The Bridges', true, 0, 'assets/b8fc567d-a74f-475f-a864-1e55446e5777.jpg'
FROM units u WHERE u.unit_code = 'CABIN-FRANK'
ON CONFLICT DO NOTHING;

-- Jessie's Hideaway (cabin) -> img-7798 (resort amenities/cabin)
INSERT INTO unit_media (unit_id, image_url, alt_text, is_primary, sort_order, storage_path)
SELECT u.id, 'https://vibe.filesafe.space/1790196628861484830/assets/0d9abec6-3cfb-413a-b63e-f2110da45dd9.jpg', 'Jessie''s Hideaway cabin at The Bridges', true, 0, 'assets/0d9abec6-3cfb-413a-b63e-f2110da45dd9.jpg'
FROM units u WHERE u.unit_code = 'CABIN-JESSIE'
ON CONFLICT DO NOTHING;

-- Owls Nest Room 42 -> room-41 (guest lodging)
INSERT INTO unit_media (unit_id, image_url, alt_text, is_primary, sort_order, storage_path)
SELECT u.id, 'https://vibe.filesafe.space/1790196628861484830/assets/dc17e0c3-4e99-4b89-a69a-d623b2504ca8.jpg', 'Owls Nest Room 42 at The Bridges', true, 0, 'assets/dc17e0c3-4e99-4b89-a69a-d623b2504ca8.jpg'
FROM units u WHERE u.unit_code = 'ROOM-42'
ON CONFLICT DO NOTHING;

-- Owls Nest Room 44 -> img-9626 (resort amenities/room)
INSERT INTO unit_media (unit_id, image_url, alt_text, is_primary, sort_order, storage_path)
SELECT u.id, 'https://vibe.filesafe.space/1790196628861484830/assets/6eb4c2ea-6cc9-4cd6-8967-f444d1821ae6.jpg', 'Owls Nest Room 44 at The Bridges', true, 0, 'assets/6eb4c2ea-6cc9-4cd6-8967-f444d1821ae6.jpg'
FROM units u WHERE u.unit_code = 'ROOM-44'
ON CONFLICT DO NOTHING;

-- Hillside Haven Room 51 -> dsc2575 (resort grounds)
INSERT INTO unit_media (unit_id, image_url, alt_text, is_primary, sort_order, storage_path)
SELECT u.id, 'https://vibe.filesafe.space/1790196628861484830/assets/cab64087-066e-4e81-bd41-ad9bd9aba5f4.jpg', 'Hillside Haven Room 51 at The Bridges', true, 0, 'assets/cab64087-066e-4e81-bd41-ad9bd9aba5f4.jpg'
FROM units u WHERE u.unit_code = 'ROOM-51'
ON CONFLICT DO NOTHING;

-- 4. Sync primary_image_url on those units
UPDATE units u
SET primary_image_url = m.image_url
FROM unit_media m
WHERE m.unit_id = u.id AND m.is_primary = true
  AND u.unit_code IN ('CABIN-FRANK','CABIN-JESSIE','ROOM-42','ROOM-44','ROOM-51');