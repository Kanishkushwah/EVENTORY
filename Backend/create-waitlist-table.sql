-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard → your project → SQL Editor

CREATE TABLE IF NOT EXISTS waitlist (
    id              BIGSERIAL PRIMARY KEY,
    email           TEXT NOT NULL,
    event_id        TEXT NOT NULL,
    event_title     TEXT,
    event_date      DATE,
    joined_at       TIMESTAMPTZ DEFAULT NOW(),
    notified        BOOLEAN DEFAULT FALSE,
    notified_at     TIMESTAMPTZ,
    UNIQUE(email, event_id)
);

-- Index for fast querying
CREATE INDEX IF NOT EXISTS idx_waitlist_event_id ON waitlist(event_id, notified);
