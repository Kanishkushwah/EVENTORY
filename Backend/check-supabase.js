import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load ENV
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function checkConnection() {
    console.log("Checking Supabase Connection...");
    const start = Date.now();
    const { data, error } = await supabase.from('users').select('count', { count: 'exact', head: true });
    const end = Date.now();

    if (error) {
        console.error("❌ Connection Failed:", error);
    } else {
        console.log(`✅ Connection Successful! Took ${end - start}ms`);
    }
}

checkConnection();
