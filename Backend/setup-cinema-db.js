import { supabase } from './src/config/supabase.js';
import { readFileSync } from 'fs';

async function setupCinemaDatabase() {
    console.log('🎬 Setting up Cinema Database...\n');

    try {
        // 1. Create cinemas table
        console.log('1️⃣ Creating cinemas table...');
        const { error: cinemasTableError } = await supabase.rpc('exec_sql', {
            sql_query: `
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
            `
        });

        if (cinemasTableError) console.log('Note:', cinemasTableError.message);
        else console.log('✅ Cinemas table ready\n');

        // 2. Create movie_showtimes table
        console.log('2️⃣ Creating movie_showtimes table...');
        const { error: showtimesTableError } = await supabase.rpc('exec_sql', {
            sql_query: `
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
            `
        });

        if (showtimesTableError) console.log('Note:', showtimesTableError.message);
        else console.log('✅ Showtimes table ready\n');

        // 3. Update bookings table
        console.log('3️⃣ Updating bookings table for cancellation support...');

        const bookingUpdates = [
            'ALTER TABLE bookings ADD COLUMN IF NOT EXISTS cinema_id BIGINT REFERENCES cinemas(id)',
            'ALTER TABLE bookings ADD COLUMN IF NOT EXISTS showtime_id BIGINT REFERENCES movie_showtimes(id)',
            'ALTER TABLE bookings ADD COLUMN IF NOT EXISTS booking_status VARCHAR(50) DEFAULT \'confirmed\'',
            'ALTER TABLE bookings ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP',
            'ALTER TABLE bookings ADD COLUMN IF NOT EXISTS cancellation_reason TEXT',
            'ALTER TABLE bookings ADD COLUMN IF NOT EXISTS refund_status VARCHAR(50)',
            'ALTER TABLE bookings ADD COLUMN IF NOT EXISTS refund_amount DECIMAL(10, 2)'
        ];

        for (const update of bookingUpdates) {
            await supabase.rpc('exec_sql', { sql_query: update });
        }
        console.log('✅ Bookings table updated\n');

        // 4. Insert sample cinemas
        console.log('4️⃣ Inserting Mumbai cinemas...');
        const { data: existingCinemas } = await supabase.from('cinemas').select('id').limit(1);

        if (!existingCinemas || existingCinemas.length === 0) {
            const cinemas = [
                { name: 'PVR Phoenix Marketcity', location: 'Lower Parel', address: '462, Senapati Bapat Marg, Mumbai', city: 'Mumbai', latitude: 19.0130, longitude: 72.8302, total_screens: 8 },
                { name: 'INOX R-City Mall', location: 'Ghatkopar', address: 'R City Mall, LBS Marg, Mumbai', city: 'Mumbai', latitude: 19.0860, longitude: 72.9081, total_screens: 6 },
                { name: 'Cinepolis Fun Republic', location: 'Andheri', address: 'Fun Republic Mall, Andheri West, Mumbai', city: 'Mumbai', latitude: 19.1368, longitude: 72.8261, total_screens: 5 },
                { name: 'PVR Juhu', location: 'Juhu', address: 'Juhu Tara Road, Mumbai', city: 'Mumbai', latitude: 19.1076, longitude: 72.8263, total_screens: 4 },
                { name: 'INOX Megaplex Inorbit', location: 'Malad', address: 'Inorbit Mall, Malad West, Mumbai', city: 'Mumbai', latitude: 19.1760, longitude: 72.8344, total_screens: 7 }
            ];

            const { error: insertError } = await supabase.from('cinemas').insert(cinemas);
            if (insertError) console.log('Error inserting cinemas:', insertError.message);
            else console.log('✅ 5 cinemas added\n');
        } else {
            console.log('✅ Cinemas already exist\n');
        }

        // 5. Verify
        console.log('5️⃣ Verifying setup...');
        const { data: allCinemas } = await supabase.from('cinemas').select('name, location, total_screens');

        if (allCinemas) {
            console.log(`\n📍 ${allCinemas.length} Cinemas in database:`);
            allCinemas.forEach(c => console.log(`   - ${c.name} (${c.location}) - ${c.total_screens} screens`));
        }

        console.log('\n🎉 Cinema database setup complete!\n');

    } catch (err) {
        console.error('❌ Error:', err);
    }
}

setupCinemaDatabase();
