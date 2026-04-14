
-- Fix play_events: require auth for insert
DROP POLICY "Anyone can insert play events" ON public.play_events;
CREATE POLICY "Authenticated users can insert play events"
  ON public.play_events FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

-- Fix public bucket listing: restrict to specific paths only
DROP POLICY "Anyone can view artwork" ON storage.objects;
CREATE POLICY "Anyone can view artwork files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'episode-artwork' AND (storage.filename(name) IS NOT NULL));

DROP POLICY "Anyone can view avatars" ON storage.objects;
CREATE POLICY "Anyone can view avatar files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars' AND (storage.filename(name) IS NOT NULL));
