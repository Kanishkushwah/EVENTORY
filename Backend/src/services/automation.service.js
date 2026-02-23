import { supabase } from '../config/supabase.js';
import cron from 'node-cron';

export const AutomationService = {

    // ---------------------------------------------------------
    // 1. Sync Upcoming Movies (Real Data)
    // ---------------------------------------------------------
    async syncUpcomingMovies() {
        console.log("🎬 Syncing Upcoming Movies...");

        const movies = [
            {
                title: "Avengers: Doomsday",
                date: "2026-12-18", // Official Release
                time: "Multiple Showtimes",
                venue: "Multiple Cinemas",
                price: 300,
                category: "Movies",
                image_url: "https://m.media-amazon.com/images/M/MV5BNTIzNTBiOWQtMzBmZi00NDQ5LWI2YWEtYjE4YTk5ZTFkZDA0XkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg",
                description: "The Avengers must assemble once more to face their greatest threat yet. Releasing December 18, 2026."
            },
            {
                title: "Avatar: Fire and Ash",
                date: "2025-12-19", // Dec 2025 Release
                time: "Multiple Showtimes",
                venue: "Multiple Cinemas",
                price: 350,
                category: "Movies",
                image_url: "https://upload.wikimedia.org/wikipedia/en/thumb/5/53/Avatar_Fire_and_Ash_poster.jpg/220px-Avatar_Fire_and_Ash_poster.jpg",
                description: "James Cameron's next chapter in the Avatar saga. Experience Pandora like never before."
            },
            {
                title: "Shrek 5",
                date: "2026-07-01",
                time: "Multiple Showtimes",
                venue: "Multiple Cinemas",
                price: 250,
                category: "Movies",
                image_url: "https://upload.wikimedia.org/wikipedia/en/thumb/8/88/Shrek_5_poster.jpg/220px-Shrek_5_poster.jpg",
                description: "The ogre is back! Join Shrek, Donkey, and Puss in Boots for a new adventure. Coming Soon."
            },
            {
                title: "The Mandalorian & Grogu",
                date: "2026-05-22",
                time: "Multiple Showtimes",
                venue: "Multiple Cinemas",
                price: 280,
                category: "Movies",
                image_url: "https://lumiere-a.akamaihd.net/v1/images/mandalorian-grogu-feature-poster_1a9b0c7e.jpeg",
                description: "The Mandalorian and Grogu embark on a new journey in this Star Wars theatrical event."
            },
            {
                title: "Supergirl: Woman of Tomorrow",
                date: "2026-06-26",
                time: "Multiple Showtimes",
                venue: "Multiple Cinemas",
                price: 260,
                category: "Movies",
                image_url: "https://upload.wikimedia.org/wikipedia/en/thumb/c/c2/Supergirl_Woman_of_Tomorrow_cover.jpg/220px-Supergirl_Woman_of_Tomorrow_cover.jpg",
                description: "A new era for the Girl of Steel. Based on the acclaimed comic book run."
            },
            {
                title: "Toy Story 5",
                date: "2026-06-19",
                time: "Multiple Showtimes",
                venue: "Multiple Cinemas",
                price: 250,
                category: "Movies",
                image_url: "https://lumiere-a.akamaihd.net/v1/images/p_toystory5_concept_24567_f9c7e0c4.jpeg",
                description: "Woody and Buzz return for one more adventure. Pixar's classic continues."
            }
        ];

        let addedCount = 0;
        for (const movieEvent of movies) {
            // Check if exists
            const { data: existing } = await supabase
                .from('events')
                .select('id')
                .eq('title', movieEvent.title)
                .single();

            if (!existing) {
                const { data, error } = await supabase.from('events').insert([movieEvent]).select().single();
                if (!error && data) {
                    addedCount++;
                    await this.generateShowtimesForMovie(data);
                }
            } else {
                // Update existing with better data
                await supabase.from('events').update(movieEvent).eq('id', existing.id);
            }
        }
        console.log(`✅ Synced ${addedCount} New Movies.`);
    },

    // Helper to generate showtimes for new movies
    async generateShowtimesForMovie(event) {
        if (event.category !== 'Movies') return;

        const { data: cinemas } = await supabase.from('cinemas').select('id');
        if (!cinemas || cinemas.length === 0) return;

        const showtimes = [];
        const today = new Date();

        // Generate for 3 days
        for (let i = 0; i < 3; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() + i);
            const dateStr = date.toISOString().split('T')[0];

            cinemas.forEach(cinema => {
                showtimes.push({
                    event_id: event.id,
                    cinema_id: cinema.id,
                    show_date: dateStr,
                    show_time: '10:00 AM',
                    available_seats: 100,
                    price: event.price
                });
                showtimes.push({
                    event_id: event.id,
                    cinema_id: cinema.id,
                    show_date: dateStr,
                    show_time: '02:00 PM',
                    available_seats: 120,
                    price: event.price + 50
                });
                showtimes.push({
                    event_id: event.id,
                    cinema_id: cinema.id,
                    show_date: dateStr,
                    show_time: '06:00 PM',
                    available_seats: 120,
                    price: event.price + 100
                });
            });
        }

        if (showtimes.length > 0) {
            await supabase.from('movie_showtimes').insert(showtimes);
        }
    },

    // ---------------------------------------------------------
    // 2. Sync T20 World Cup 2026 Matches (India & Sri Lanka Co-Hosts)
    // ---------------------------------------------------------
    async syncWorldCupEvents() {
        console.log("🏆 Syncing ICC T20 World Cup 2026 Matches...");

        // First, let's clear old matches to force a refresh with new images
        // In production you wouldn't do this, but for dev cleanup it's perfect
        const { error: delError } = await supabase
            .from('events')
            .delete()
            .ilike('title', '%World Cup 2026%');

        if (!delError) console.log("🧹 Cleared old World Cup matches for fresh sync.");

        const matches = [
            // INDIA MATCHES
            {
                title: "India vs Pakistan - T20 World Cup 2026",
                date: "2026-03-01",
                time: "07:00 PM IST",
                venue: "Eden Gardens, Kolkata",
                price: 2500,
                category: "Sports",
                image_url: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&q=80&w=1000",
                description: "Group Stage: The mother of all battles! India takes on Pakistan in Colombo. A high-voltage encounter you cannot miss."
            },
            {
                title: "India vs England - T20 World Cup 2026",
                date: "2026-02-22",
                time: "07:30 PM IST",
                venue: "Eden Gardens, Kolkata",
                price: 1500,
                category: "Sports",
                image_url: "https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?auto=format&fit=crop&q=80&w=1000",
                description: "Super 8: India hosts the defending champions England at the historic Eden Gardens."
            },
            {
                title: "India vs Australia - T20 World Cup 2026",
                date: "2026-03-05",
                time: "07:30 PM IST",
                venue: "Eden Gardens, Kolkata",
                price: 2000,
                category: "Sports",
                image_url: "https://images.unsplash.com/photo-1593341646782-e0b495cffd32?auto=format&fit=crop&q=80&w=1000",
                description: "Super 8: A clash of titans in Mumbai. Can India overcome the Aussie challenge?"
            },

            // SRI LANKA MATCHES
            {
                title: "Sri Lanka vs Bangladesh - T20 World Cup 2026",
                date: "2026-02-18",
                time: "07:00 PM IST",
                venue: "Eden Gardens, Kolkata",
                price: 800,
                category: "Sports",
                image_url: "https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&q=80&w=1000",
                description: "Asian Rivalry: The hosts Sri Lanka take on Bangladesh in a heated contest."
            },
            {
                title: "Sri Lanka vs South Africa - T20 World Cup 2026",
                date: "2026-02-25",
                time: "07:00 PM IST",
                venue: "Eden Gardens, Kolkata",
                price: 1000,
                category: "Sports",
                image_url: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&q=80&w=1000",
                description: "The Lions face the Proteas in front of a home crowd in Colombo."
            },

            // OTHER BIG MATCHES
            {
                title: "Australia vs New Zealand - T20 World Cup 2026",
                date: "2026-02-20",
                time: "03:30 PM IST",
                venue: "Eden Gardens, Kolkata",
                price: 1000,
                category: "Sports",
                image_url: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_w_1200,q_50/lsci/db/PICTURES/CMS/330500/330561.jpg",
                description: "Trans-Tasman rivalry lights up Bangalore! High scoring game expected."
            },
            {
                title: "Pakistan vs England - T20 World Cup 2026",
                date: "2026-02-28",
                time: "07:30 PM IST",
                venue: "Eden Gardens, Kolkata",
                price: 1200,
                category: "Sports",
                image_url: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_w_1200,q_50/lsci/db/PICTURES/CMS/348600/348666.jpg",
                description: "A repeat of the 2022 Final! Who will come out on top in the world's largest stadium?"
            },
            {
                title: "West Indies vs Afghanistan - T20 World Cup 2026",
                date: "2026-03-02",
                time: "03:30 PM IST",
                venue: "Eden Gardens, Kolkata",
                price: 600,
                category: "Sports",
                image_url: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_w_1200,q_50/lsci/db/PICTURES/CMS/383400/383495.jpg", // WI vs AFG
                description: "The Power hitters from the Caribbean take on the spin wizards from Afghanistan."
            },
            {
                title: "South Africa vs New Zealand - T20 World Cup 2026",
                date: "2026-03-04",
                time: "07:30 PM IST",
                venue: "Eden Gardens, Kolkata",
                price: 900,
                category: "Sports",
                image_url: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_w_1200,q_50/lsci/db/PICTURES/CMS/370700/370757.jpg", // SA vs NZ
                description: "A crucial encounter for both teams looking to secure a semi-final spot."
            },
            {
                title: "England vs Australia - T20 World Cup 2026",
                date: "2026-03-08",
                time: "07:30 PM IST",
                venue: "Eden Gardens, Kolkata",
                price: 1800,
                category: "Sports",
                image_url: "https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?auto=format&fit=crop&q=80&w=1000", // Reliable Cricket Image (batting/fielding)
                description: "The Ashes rivalry continues in the shortest format. Expect fireworks!"
            }
        ];

        let addedCount = 0;
        for (const match of matches) {
            // Check if exists logic removed because we force cleaned
            const { error } = await supabase.from('events').insert([match]);
            if (!error) addedCount++;
            else console.error(`Failed to add match: ${match.title}`, error);
        }
        console.log(`✅ Synced ${addedCount} T20 World Cup Matches.`);
    },

    // 3. Initialize Scheduler
    initScheduler() {
        console.log("⏰ Automation Scheduler Initialized");

        // Schedule check every 24 hours
        cron.schedule('0 0 * * *', async () => {
            await this.syncWorldCupEvents();
            await this.syncUpcomingMovies();
            console.log("🔄 Daily Event Sync Completed");
        });

        // Initial run
        this.syncWorldCupEvents();
        this.syncUpcomingMovies();
    }
};
