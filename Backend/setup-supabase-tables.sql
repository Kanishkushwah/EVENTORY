-- ════════════════════════════════════════════════════════
-- Run ALL of this in your Supabase SQL Editor at once
-- Dashboard → Project → SQL Editor → New Query → Run
-- ════════════════════════════════════════════════════════

-- 1. Site config (hero section + releases list)
CREATE TABLE IF NOT EXISTS site_config (
    id          INT PRIMARY KEY DEFAULT 1,
    config      JSONB NOT NULL,
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE site_config ADD CONSTRAINT IF NOT EXISTS site_config_single_row CHECK (id = 1);

-- 2. Movie release notification subscribers
CREATE TABLE IF NOT EXISTS release_notifications (
    id              BIGSERIAL PRIMARY KEY,
    email           TEXT NOT NULL,
    movie_id        TEXT NOT NULL,
    movie_title     TEXT,
    release_date    DATE,
    subscribed_at   TIMESTAMPTZ DEFAULT NOW(),
    notified        BOOLEAN DEFAULT FALSE,
    notified_at     TIMESTAMPTZ,
    UNIQUE(email, movie_id)
);
CREATE INDEX IF NOT EXISTS idx_release_notifications_movie ON release_notifications(movie_id, notified);

-- 3. Waitlist for sold-out events
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
CREATE INDEX IF NOT EXISTS idx_waitlist_event_id ON waitlist(event_id, notified);
