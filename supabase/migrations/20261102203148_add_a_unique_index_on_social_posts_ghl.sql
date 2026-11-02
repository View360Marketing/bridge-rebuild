-- Unique index for GHL post sync (upsert by ghl_post_id without duplicates)
CREATE UNIQUE INDEX IF NOT EXISTS social_posts_ghl_post_id_idx
  ON social_posts (ghl_post_id)
  WHERE ghl_post_id IS NOT NULL;

-- Allow authenticated staff to read the social-media storage bucket objects
GRANT SELECT ON storage.objects TO authenticated;