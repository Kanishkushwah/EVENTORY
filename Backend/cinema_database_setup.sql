-- EVENTORY Cinema Multi-Location & Booking Cancellation Database Setup

-- ============================================
-- 1. CREATE CINEMAS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS cinemas (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    address TEXT,
    city VARCHAR(100),
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),
    total_screens INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Index for location-based queries
CREATE INDEX IF NOT EXISTS idx_cinemas_city ON cinemas(city);
CREATE INDEX IF NOT EXISTS idx_cinemas_location ON cinemas(location);

-- ============================================
-- 2. CREATE MOVIE SHOWTIMES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS movie_showtimes (
    id BIGSERIAL PRIMARY KEY,
    event_id BIGINT REFERENCES events(id) ON DELETE CASCADE,
    cinema_id BIGINT REFERENCES cinemas(id) ON DELETE CASCADE,
    show_date DATE NOT NULL,
    show_time TIME NOT NULL,
    screen_number INTEGER,
    available_seats INTEGER DEFAULT 100,
    price DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_showtimes_event ON movie_showtimes(event_id);
CREATE INDEX IF NOT EXISTS idx_showtimes_cinema ON movie_showtimes(cinema_id);
CREATE INDEX IF NOT EXISTS idx_showtimes_date ON movie_showtimes(show_date);

-- ============================================
-- 3. UPDATE BOOKINGS TABLE FOR CANCELLATION
-- ============================================
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS cinema_id BIGINT REFERENCES cinemas(id),
ADD COLUMN IF NOT EXISTS showtime_id BIGINT REFERENCES movie_showtimes(id),
ADD COLUMN IF NOT EXISTS booking_status VARCHAR(50) DEFAULT 'confirmed',
ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS cancellation_reason TEXT,
ADD COLUMN IF NOT EXISTS refund_status VARCHAR(50),
ADD COLUMN IF NOT EXISTS refund_amount DECIMAL(10, 2);

-- Index for status queries
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(booking_status);
CREATE INDEX IF NOT EXISTS idx_bookings_cinema ON bookings(cinema_id);
CREATE INDEX IF NOT EXISTS idx_bookings_showtime ON bookings(showtime_id);

-- ============================================
-- 4. INSERT SAMPLE CINEMA DATA (Mumbai)
-- ============================================
INSERT INTO cinemas (name, location, address, city, latitude, longitude, total_screens) VALUES
('PVR Phoenix Marketcity', 'Lower Parel', '462, Senapati Bapat Marg, Lower Parel, Mumbai', 'Mumbai', 19.0130, 72.8302, 8),
('INOX R-City Mall', 'Ghatkopar', 'R City Mall, LBS Marg, Ghatkopar West, Mumbai', 'Mumbai', 19.0860, 72.9081, 6),
('Cinepolis Fun Republic', 'Andheri', 'Fun Republic Mall, New Link Road, Andheri West, Mumbai', 'Mumbai', 19.1368, 72.8261, 5),
('PVR Juhu', 'Juhu', 'Juhu Tara Road, Santacruz West, Mumbai', 'Mumbai', 19.1076, 72.8263, 4),
('INOX Megaplex', 'Malad', 'Inorbit Mall, Malad West, Mumbai', 'Mumbai', 19.1760, 72.8344, 7)
ON CONFLICT DO NOTHING;

-- ============================================
-- 5. INSERT SAMPLE SHOW TIMES FOR TESTING
-- (Assumes event_id 1 exists - update as needed)
-- ============================================

-- Get the first movie event ID (if exists)
DO $$
DECLARE
    movie_event_id BIGINT;
    cinema1_id BIGINT;
    cinema2_id BIGINT;
    cinema3_id BIGINT;
BEGIN
    -- Get first movie event
    SELECT id INTO movie_event_id FROM events WHERE category = 'Movies' LIMIT 1;
    
    -- Get cinema IDs
    SELECT id INTO cinema1_id FROM cinemas WHERE name LIKE 'PVR Phoenix%' LIMIT 1;
    SELECT id INTO cinema2_id FROM cinemas WHERE name LIKE 'INOX R-City%' LIMIT 1;
    SELECT id INTO cinema3_id FROM cinemas WHERE name LIKE 'Cinepolis%' LIMIT 1;
    
    -- Insert show times if movie event exists
    IF movie_event_id IS NOT NULL AND cinema1_id IS NOT NULL THEN
        -- PVR Phoenix shows
        INSERT INTO movie_showtimes (event_id, cinema_id, show_date, show_time, screen_number, available_seats, price) VALUES
        (movie_event_id, cinema1_id, CURRENT_DATE + INTERVAL '1 day', '10:00:00', 1, 100, 250),
        (movie_event_id, cinema1_id, CURRENT_DATE + INTERVAL '1 day', '13:30:00', 1, 100, 300),
        (movie_event_id, cinema1_id, CURRENT_DATE + INTERVAL '1 day', '16:45:00', 2, 100, 300),
        (movie_event_id, cinema1_id, CURRENT_DATE + INTERVAL '1 day', '20:00:00', 2, 100, 350);
        
        -- INOX shows
        IF cinema2_id IS NOT NULL THEN
            INSERT INTO movie_showtimes (event_id, cinema_id, show_date, show_time, screen_number, available_seats, price) VALUES
            (movie_event_id, cinema2_id, CURRENT_DATE + INTERVAL '1 day', '11:00:00', 3, 90, 220),
            (movie_event_id, cinema2_id, CURRENT_DATE + INTERVAL '1 day', '14:30:00', 3, 90, 280),
            (movie_event_id, cinema2_id, CURRENT_DATE + INTERVAL '1 day', '18:00:00', 4, 90, 280);
        END IF;
        
        -- Cinepolis shows
        IF cinema3_id IS NOT NULL THEN
            INSERT INTO movie_showtimes (event_id, cinema_id, show_date, show_time, screen_number, available_seats, price) VALUES
            (movie_event_id, cinema3_id, CURRENT_DATE + INTERVAL '1 day', '12:00:00', 1, 80, 280),
            (movie_event_id, cinema3_id, CURRENT_DATE + INTERVAL '1 day', '15:30:00', 1, 80, 320),
            (movie_event_id, cinema3_id, CURRENT_DATE + INTERVAL '1 day', '19:00:00', 2, 80, 320);
        END IF;
    END IF;
END $$;

-- ============================================
-- 6. VERIFICATION QUERIES
-- ============================================

-- Check cinemas
SELECT 'Cinemas Created:' as info, COUNT(*) as count FROM cinemas;

-- Check show times
SELECT 'Show Times Created:' as info, COUNT(*) as count FROM movie_showtimes;

-- View sample data
SELECT 
    c.name as cinema,
    c.location,
    c.total_screens,
    COUNT(ms.id) as total_shows
FROM cinemas c
LEFT JOIN movie_showtimes ms ON c.id = ms.cinema_id
GROUP BY c.id, c.name, c.location, c.total_screens
ORDER BY c.name;
