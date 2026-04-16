
-- Make episode-audio bucket public so getPublicUrl works
UPDATE storage.buckets SET public = true WHERE id = 'episode-audio';

-- Ensure public read policy exists (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' AND schemaname = 'storage' 
    AND policyname = 'Public read access for episode audio'
  ) THEN
    CREATE POLICY "Public read access for episode audio"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'episode-audio');
  END IF;
END $$;
