import { supabase } from './src/config/supabase.js';

async function fix() {
  await supabase.from('movie_showtimes').delete().eq('event_id', 1557);
  console.log('Deleted old showtimes');
}
fix().then(() => process.exit(0));
