import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanBadEvents() {
    console.log("🧹 Cleaning up old generic World Cup matches...");

    // Delete events that have the generic Unsplash stadium image AND are Sports category
    const genericImage = "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&q=80&w=1000";

    const { error } = await supabase
        .from('events')
        .delete()
        .eq('category', 'Sports')
        .ilike('title', '%World Cup%'); // Only delete World Cup matches, keep other sports if any

    if (error) {
        console.error("Error deleting events:", error);
    } else {
        console.log("✅ Successfully deleted old World Cup matches.");
    }
}

cleanBadEvents();
