import { supabase } from './src/config/supabase.js';

async function check() {
    const { data: movies } = await supabase.from('events').select('id').eq('category', 'Movies').limit(1);
    if (movies && movies.length > 0) {
        const movieId = movies[0].id;
        console.log(`Checking showtimes for movie ${movieId}`);
        let { data, error } = await supabase
            .from('movie_showtimes')
            .select(`*, cinema:cinemas(id, name, city)`)
            .eq('event_id', movieId)
            .ilike('cinema.city', 'Hyderabad');
        if (data) {
            data = data.filter(d => d.cinema !== null); // postgrest inner join fake
            console.log(`Found ${data.length} showtimes in Hyderabad for movie ${movieId}`);
        } else {
            console.error(error);
        }
    }
}
check().then(() => process.exit(0));
