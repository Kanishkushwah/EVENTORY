-- Promo Codes Table for Eventory 🎬
CREATE TABLE IF NOT EXISTS public.promo_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    discount_percent INT NOT NULL,
    max_discount_amount INT DEFAULT 500,
    min_purchase_amount INT DEFAULT 0,
    valid_until TIMESTAMPTZ,
    usage_limit INT DEFAULT 100,
    times_used INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed with some promo codes
INSERT INTO public.promo_codes (code, discount_percent, max_discount_amount, min_purchase_amount, description, valid_until)
VALUES 
('EVENTORY20', 20, 200, 500, '20% off up to ₹200 on bookings above ₹500', '2026-12-31 23:59:59+00'),
('WELCOME50', 50, 100, 0, 'New user special: 50% off up to ₹100', '2026-12-31 23:59:59+00'),
('MOVIE60', 10, 60, 200, 'Movie magic: ₹60 off on movie bookings', '2026-12-31 23:59:59+00')
ON CONFLICT (code) DO NOTHING;
