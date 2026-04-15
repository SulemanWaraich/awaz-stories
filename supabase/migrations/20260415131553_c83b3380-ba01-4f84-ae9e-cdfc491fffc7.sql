-- Add public read policy for episode-audio bucket
CREATE POLICY "Public read access for episode audio"
ON storage.objects FOR SELECT
USING (bucket_id = 'episode-audio');