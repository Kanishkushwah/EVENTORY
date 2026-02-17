import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load ENV
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function cleanDuplicates() {
    console.log("🧹 Cleaning up duplicate movies...");

    // 1. Fetch all movies
    const { data: movies, error } = await supabase
        .from('events')
        .select('id, title, category')
        .ilike('category', 'movies'); // Only target movies

    if (error) {
        console.error("Error fetching movies:", error);
        return;
    }

    // 2. Identify duplicates
    const seenTitles = new Set();
    const duplicates = [];

    for (const movie of movies) {
        const titleKey = movie.title.toLowerCase().trim();
        if (seenTitles.has(titleKey)) {
            duplicates.push(movie.id);
        } else {
            seenTitles.add(titleKey);
        }
    }

    console.log(`Found ${duplicates.length} duplicate movies.`);

    // 3. Delete duplicates
    if (duplicates.length > 0) {
        const { error: delError } = await supabase
            .from('events')
            .delete()
            .in('id', duplicates);

        if (delError) {
            console.error("Error deleting duplicates:", delError);
        } else {
            console.log("✅ Successfully deleted duplicates.");
        }
    } else {
        console.log("✨ No duplicates found.");
    }
}

cleanDuplicates();
