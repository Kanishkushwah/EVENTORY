-- Waitlist Table for Eventory 🎬
CREATE TABLE IF NOT EXISTS public.waitlist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL,
    event_id TEXT NOT NULL,
    event_title TEXT NOT NULL,
    event_date TIMESTAMPTZ,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    notified BOOLEAN DEFAULT FALSE,
    notified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookup by event
CREATE INDEX IF NOT EXISTS idx_waitlist_event ON public.waitlist(event_id);
CREATE INDEX IF NOT EXISTS idx_waitlist_notified ON public.waitlist(notified);
