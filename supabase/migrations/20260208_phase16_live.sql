-- ================================================
-- Phase 16: Live Experience Tables
-- Run this in Supabase SQL Editor
-- ================================================

-- 1. Live Messages Table (for live chat)
CREATE TABLE IF NOT EXISTS live_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    user_name TEXT NOT NULL,
    user_avatar TEXT,
    content TEXT NOT NULL CHECK (char_length(content) <= 500),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_live_messages_event_id ON live_messages(event_id);
CREATE INDEX IF NOT EXISTS idx_live_messages_created_at ON live_messages(created_at);

-- Enable RLS
ALTER TABLE live_messages ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can read live messages" ON live_messages
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert messages" ON live_messages
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own messages" ON live_messages
    FOR DELETE USING (auth.uid() = user_id);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE live_messages;

-- ================================================
-- 2. Event Participants Table (for RSVP)
-- ================================================

CREATE TABLE IF NOT EXISTS event_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    user_email TEXT NOT NULL,
    user_name TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(event_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_event_participants_event_id ON event_participants(event_id);

ALTER TABLE event_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read participant count" ON event_participants
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can RSVP" ON event_participants
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove own RSVP" ON event_participants
    FOR DELETE USING (auth.uid() = user_id);

-- ================================================
-- Done! Don't forget to enable realtime in Supabase dashboard
-- ================================================
