-- Atomic play count increment (avoids race conditions)
CREATE OR REPLACE FUNCTION public.increment_play_count(episode_uuid UUID)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.episodes 
  SET play_count = COALESCE(play_count, 0) + 1 
  WHERE id = episode_uuid;
$$;

-- Count plays in last 24h (for landing page social proof)
CREATE OR REPLACE FUNCTION public.plays_last_24h()
RETURNS bigint
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*) FROM public.play_events
  WHERE played_at > NOW() - INTERVAL '24 hours';
$$;

GRANT EXECUTE ON FUNCTION public.increment_play_count(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.plays_last_24h() TO anon, authenticated;