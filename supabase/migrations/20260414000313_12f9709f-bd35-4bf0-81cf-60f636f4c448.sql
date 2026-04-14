
-- ======================
-- PROFILES TABLE
-- ======================
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role TEXT DEFAULT 'listener' CHECK (role IN ('listener', 'creator', 'admin')),
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  social_links JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- ======================
-- CATEGORIES TABLE
-- ======================
CREATE TABLE public.categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  name_urdu TEXT,
  color_hex TEXT DEFAULT '#2C5F4A',
  slug TEXT UNIQUE NOT NULL
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories are viewable by everyone"
  ON public.categories FOR SELECT USING (true);

-- ======================
-- SERIES TABLE
-- ======================
CREATE TABLE public.series (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  title_urdu TEXT,
  description TEXT,
  artwork_url TEXT,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.series ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Series are viewable by everyone"
  ON public.series FOR SELECT USING (true);

CREATE POLICY "Creators can insert their own series"
  ON public.series FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update their own series"
  ON public.series FOR UPDATE USING (auth.uid() = creator_id);

CREATE POLICY "Creators can delete their own series"
  ON public.series FOR DELETE USING (auth.uid() = creator_id);

-- ======================
-- EPISODES TABLE
-- ======================
CREATE TABLE public.episodes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  series_id UUID REFERENCES public.series(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  title_urdu TEXT,
  description TEXT,
  audio_url TEXT,
  artwork_url TEXT,
  duration_seconds INTEGER DEFAULT 0,
  transcript_url TEXT,
  category_ids INTEGER[] DEFAULT '{}',
  language TEXT DEFAULT 'en' CHECK (language IN ('en', 'ur', 'both')),
  has_content_warning BOOLEAN DEFAULT FALSE,
  warning_text TEXT,
  allow_download BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','scheduled','published','archived')),
  publish_at TIMESTAMPTZ,
  play_count INTEGER DEFAULT 0,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.episodes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published episodes"
  ON public.episodes FOR SELECT
  USING (status = 'published' OR auth.uid() = creator_id);

CREATE POLICY "Creators can insert their own episodes"
  ON public.episodes FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update their own episodes"
  ON public.episodes FOR UPDATE
  USING (auth.uid() = creator_id);

CREATE POLICY "Creators can delete their own episodes"
  ON public.episodes FOR DELETE
  USING (auth.uid() = creator_id);

-- ======================
-- LIKES TABLE
-- ======================
CREATE TABLE public.likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  episode_id UUID REFERENCES public.episodes(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, episode_id)
);

ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read likes"
  ON public.likes FOR SELECT USING (true);

CREATE POLICY "Authenticated users can like"
  ON public.likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own likes"
  ON public.likes FOR DELETE
  USING (auth.uid() = user_id);

-- ======================
-- BOOKMARKS TABLE
-- ======================
CREATE TABLE public.bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  episode_id UUID REFERENCES public.episodes(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, episode_id)
);

ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own bookmarks"
  ON public.bookmarks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bookmarks"
  ON public.bookmarks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own bookmarks"
  ON public.bookmarks FOR DELETE
  USING (auth.uid() = user_id);

-- ======================
-- COMMENTS TABLE
-- ======================
CREATE TABLE public.comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  episode_id UUID REFERENCES public.episodes(id) ON DELETE CASCADE NOT NULL,
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  display_name TEXT,
  is_anonymous BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read non-deleted comments"
  ON public.comments FOR SELECT
  USING (deleted_at IS NULL);

CREATE POLICY "Authenticated users can comment"
  ON public.comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can soft-delete their own comments"
  ON public.comments FOR UPDATE
  USING (auth.uid() = user_id);

-- ======================
-- PLAY EVENTS TABLE
-- ======================
CREATE TABLE public.play_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  episode_id UUID REFERENCES public.episodes(id) ON DELETE CASCADE NOT NULL,
  duration_played_seconds INTEGER DEFAULT 0,
  played_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.play_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert play events"
  ON public.play_events FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can read their own play events"
  ON public.play_events FOR SELECT
  USING (auth.uid() = user_id);

-- ======================
-- SUBSCRIPTIONS TABLE
-- ======================
CREATE TABLE public.subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  listener_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  creator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(listener_id, creator_id)
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read subscriptions"
  ON public.subscriptions FOR SELECT USING (true);

CREATE POLICY "Users can subscribe"
  ON public.subscriptions FOR INSERT
  WITH CHECK (auth.uid() = listener_id);

CREATE POLICY "Users can unsubscribe"
  ON public.subscriptions FOR DELETE
  USING (auth.uid() = listener_id);

-- ======================
-- INDEXES
-- ======================
CREATE INDEX idx_episodes_creator ON public.episodes(creator_id);
CREATE INDEX idx_episodes_status ON public.episodes(status);
CREATE INDEX idx_episodes_slug ON public.episodes(slug);
CREATE INDEX idx_episodes_publish_at ON public.episodes(publish_at DESC);
CREATE INDEX idx_likes_episode ON public.likes(episode_id);
CREATE INDEX idx_likes_user ON public.likes(user_id);
CREATE INDEX idx_bookmarks_user ON public.bookmarks(user_id);
CREATE INDEX idx_comments_episode ON public.comments(episode_id);
CREATE INDEX idx_play_events_episode ON public.play_events(episode_id);
CREATE INDEX idx_subscriptions_creator ON public.subscriptions(creator_id);

-- ======================
-- UPDATED_AT TRIGGER
-- ======================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_episodes_updated_at
  BEFORE UPDATE ON public.episodes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ======================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ======================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'role', 'listener'),
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ======================
-- STORAGE BUCKETS
-- ======================
INSERT INTO storage.buckets (id, name, public) VALUES ('episode-audio', 'episode-audio', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('episode-artwork', 'episode-artwork', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- Storage policies for episode-audio (private - only creator can upload/read)
CREATE POLICY "Creators can upload audio"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'episode-audio' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Creators can read their own audio"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'episode-audio' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Anyone can read audio by URL"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'episode-audio');

-- Storage policies for episode-artwork (public)
CREATE POLICY "Anyone can view artwork"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'episode-artwork');

CREATE POLICY "Creators can upload artwork"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'episode-artwork' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for avatars (public)
CREATE POLICY "Anyone can view avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload avatars"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their avatars"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ======================
-- SEED CATEGORIES
-- ======================
INSERT INTO public.categories (name, name_urdu, color_hex, slug) VALUES
  ('Mental Health', 'ذہنی صحت', '#7FB5A0', 'mental-health'),
  ('Stories', 'کہانیاں', '#E8A87C', 'stories'),
  ('Relationships', 'تعلقات', '#C9A0DC', 'relationships'),
  ('Identity', 'شناخت', '#F4A261', 'identity'),
  ('Work & Life', 'کام اور زندگی', '#6B9BC3', 'work-life'),
  ('Society', 'معاشرہ', '#E76F51', 'society'),
  ('Urdu Originals', 'اردو اصل', '#2C5F4A', 'urdu-originals');
