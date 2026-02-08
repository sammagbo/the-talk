-- ================================================
-- Newsletter & Notification Tables
-- Run this in Supabase SQL Editor
-- ================================================

-- Ensure newsletter_subscribers has required columns
ALTER TABLE newsletter_subscribers 
ADD COLUMN IF NOT EXISTS name TEXT,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Notification logs table for tracking sent notifications
CREATE TABLE IF NOT EXISTS notification_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    recipients_count INTEGER DEFAULT 0,
    sent_count INTEGER DEFAULT 0,
    errors JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for querying by date
CREATE INDEX IF NOT EXISTS idx_notification_logs_created_at ON notification_logs(created_at);

-- RLS for notification_logs (admin only)
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can read notification logs" ON notification_logs
    FOR SELECT USING (false); -- Disabled by default, enable via service role

-- ================================================
-- Done! Set these secrets in Supabase Edge Functions:
-- RESEND_API_KEY - Your Resend API key
-- WEBHOOK_SECRET - Secret key for webhook authentication
-- ================================================
