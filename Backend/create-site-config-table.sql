-- Run this in your Supabase SQL Editor:
-- Dashboard → Your Project → SQL Editor → New Query → Paste → Run

CREATE TABLE IF NOT EXISTS site_config (
    id          INT PRIMARY KEY DEFAULT 1,
    config      JSONB NOT NULL,
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Constraint to ensure only 1 row ever exists (singleton pattern)
ALTER TABLE site_config ADD CONSTRAINT site_config_single_row CHECK (id = 1);
