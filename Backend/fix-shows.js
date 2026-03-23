import { supabase } from './src/config/supabase.js';

async function generateAll() {
    const { data: movies } = await supabase.from('events').select('id, price').eq('category', 'Movies');
    const { data: cinemas } = await supabase.from('cinemas').select('id, city');
    
    if(!movies || !cinemas) return console.log("Missing data");

    const newShowtimes = [];
    
    // Auto generate 15 days of content
    for (const movie of movies) {
        // delete old first
        await supabase.from('movie_showtimes').delete().eq('event_id', movie.id);
        
        for (let i = 0; i < 5; i++) {
            const d = new Date();
            d.setDate(d.getDate() + i);
            const ds = d.toISOString().split('T')[0];
            
            for (const c of cinemas) {
                const basePrice = movie.price || 200;
                newShowtimes.push({ event_id: movie.id, cinema_id: c.id, show_date: ds, show_time: '10:00 AM', screen_number: 1, available_seats: 100, price: basePrice });
                newShowtimes.push({ event_id: movie.id, cinema_id: c.id, show_date: ds, show_time: '02:30 PM', screen_number: 2, available_seats: 120, price: basePrice + 50 });
                newShowtimes.push({ event_id: movie.id, cinema_id: c.id, show_date: ds, show_time: '07:00 PM', screen_number: 1, available_seats: 100, price: basePrice + 100 });
            }
        }
        console.log(`Generated for movie ${movie.id}`);
    }
    
    console.log(`Inserting ${newShowtimes.length} showtimes...`);
    const {error} = await supabase.from('movie_showtimes').insert(newShowtimes);
    if(error) console.error(error);
    else console.log("Done");
}

generateAll().then(() => process.exit(0));
