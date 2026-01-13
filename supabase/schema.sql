-- THE TALK - Supabase Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- USERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    display_name TEXT,
    photo_url TEXT,
    badges TEXT[] DEFAULT '{}',
    language TEXT DEFAULT 'fr',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, display_name, photo_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- FAVORITES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    episode_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, episode_id)
);

-- =====================================================
-- COMMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    episode_id TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- RATINGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    episode_id TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, episode_id)
);

-- =====================================================
-- USER STATS TABLE (for badges/achievements)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_stats (
    user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    total_listens INTEGER DEFAULT 0,
    total_likes INTEGER DEFAULT 0,
    total_shares INTEGER DEFAULT 0,
    total_comments INTEGER DEFAULT 0,
    streak_days INTEGER DEFAULT 0,
    last_listen_date DATE,
    categories_explored TEXT[] DEFAULT '{}',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- PLAYBACK HISTORY TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.playback_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    episode_id TEXT NOT NULL,
    progress_seconds INTEGER DEFAULT 0,
    duration_seconds INTEGER,
    completed BOOLEAN DEFAULT FALSE,
    last_played_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, episode_id)
);

-- =====================================================
-- NEWSLETTER SUBSCRIBERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    source TEXT DEFAULT 'website',
    subscribed_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- POLLS TABLES
-- =====================================================
CREATE TABLE IF NOT EXISTS public.polls (
    id TEXT PRIMARY KEY,
    question TEXT NOT NULL,
    options JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.poll_votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    poll_id TEXT REFERENCES public.polls(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    option_index INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(poll_id, user_id)
);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playback_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;

-- Users: can read all, update own
CREATE POLICY "Users are viewable by everyone" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Favorites: user can manage their own
CREATE POLICY "Users can view own favorites" ON public.favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own favorites" ON public.favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own favorites" ON public.favorites FOR DELETE USING (auth.uid() = user_id);

-- Comments: everyone can read, user can manage own
CREATE POLICY "Comments are viewable by everyone" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Users can insert own comments" ON public.comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON public.comments FOR DELETE USING (auth.uid() = user_id);

-- Ratings: everyone can read, user can manage own
CREATE POLICY "Ratings are viewable by everyone" ON public.ratings FOR SELECT USING (true);
CREATE POLICY "Users can insert own ratings" ON public.ratings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own ratings" ON public.ratings FOR UPDATE USING (auth.uid() = user_id);

-- User Stats: user can view and update own
CREATE POLICY "Users can view own stats" ON public.user_stats FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own stats" ON public.user_stats FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own stats" ON public.user_stats FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Playback History: user can manage own
CREATE POLICY "Users can view own playback" ON public.playback_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own playback" ON public.playback_history FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own playback" ON public.playback_history FOR UPDATE USING (auth.uid() = user_id);

-- Newsletter: anyone can subscribe
CREATE POLICY "Anyone can subscribe" ON public.newsletter_subscribers FOR INSERT WITH CHECK (true);

-- Polls: everyone can read
CREATE POLICY "Polls are viewable by everyone" ON public.polls FOR SELECT USING (true);
CREATE POLICY "Poll votes are viewable by everyone" ON public.poll_votes FOR SELECT USING (true);
CREATE POLICY "Users can vote on polls" ON public.poll_votes FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_episode_id ON public.comments(episode_id);
CREATE INDEX IF NOT EXISTS idx_ratings_episode_id ON public.ratings(episode_id);
CREATE INDEX IF NOT EXISTS idx_playback_user_id ON public.playback_history(user_id);
CREATE INDEX IF NOT EXISTS idx_playback_last_played ON public.playback_history(last_played_at DESC);

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- Average ratings per episode
CREATE OR REPLACE VIEW public.episode_ratings AS
SELECT 
    episode_id,
    COUNT(*) as rating_count,
    AVG(rating)::NUMERIC(2,1) as average_rating
FROM public.ratings
GROUP BY episode_id;

-- Comment counts per episode
CREATE OR REPLACE VIEW public.episode_comment_counts AS
SELECT 
    episode_id,
    COUNT(*) as comment_count
FROM public.comments
GROUP BY episode_id;
