import { supabase } from './src/config/supabase.js';

async function generateMissingShowtimes() {
    // 1. Get all movies
    const { data: movies } = await supabase.from('events').select('id, price').eq('category', 'Movies');

    // 2. Get all cinemas that were just added
    const recentlyAddedCities = ['Hyderabad', 'Pune', 'Chennai', 'Ahmedabad', 'Jaipur', 'Chandigarh', 'Lucknow'];
    const { data: newCinemas } = await supabase.from('cinemas').select('id, city').in('city', recentlyAddedCities);

    if (!movies || !newCinemas || newCinemas.length === 0) {
        return console.log("Missing data");
    }

    const newShowtimes = [];

    // 3. For each movie, check if showtimes exist for these cinemas.
    for (const movie of movies) {
        // delete old first to avoid duplicates
        // Since these are new cinemas, delete showtimes ONLY for these new cinema IDs
        const cinemaIds = newCinemas.map(c => c.id);

        await supabase.from('movie_showtimes')
            .delete()
            .eq('event_id', movie.id)
            .in('cinema_id', cinemaIds);

        for (let i = 0; i < 5; i++) {
            const d = new Date();
            d.setDate(d.getDate() + i);
            const ds = d.toISOString().split('T')[0];

            for (const c of newCinemas) {
                const basePrice = movie.price || 200;
                newShowtimes.push({ event_id: movie.id, cinema_id: c.id, show_date: ds, show_time: '10:00 AM', screen_number: 1, available_seats: 100, price: basePrice });
                newShowtimes.push({ event_id: movie.id, cinema_id: c.id, show_date: ds, show_time: '02:30 PM', screen_number: 2, available_seats: 120, price: basePrice + 50 });
                newShowtimes.push({ event_id: movie.id, cinema_id: c.id, show_date: ds, show_time: '07:00 PM', screen_number: 1, available_seats: 100, price: basePrice + 100 });
            }
        }
    }

    console.log(`Ready to insert ${newShowtimes.length} showtimes...`);

    const chunkSize = 200;
    for (let i = 0; i < newShowtimes.length; i += chunkSize) {
        const chunk = newShowtimes.slice(i, i + chunkSize);
        console.log(`Inserting chunk ${i} to ${i + chunk.length}...`);
        const { error } = await supabase.from('movie_showtimes').insert(chunk);
        if (error) {
            console.error("Error inserting chunk:", error);
        }
    }
    console.log("Done inserting missing showtimes!");
}

generateMissingShowtimes().then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1); });
