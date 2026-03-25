import { supabase } from './src/config/supabase.js';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

async function migrate() {
    const sql = fs.readFileSync('./create-promo-table.sql', 'utf8');
    const queries = sql.split(';').filter(q => q.trim().length > 0);

    console.log("🚀 Starting Promo Code Migration...");

    // Note: Supabase JS library doesn't let us run arbitrary SQL safely like this for DDL 
    // unless the 'service_role' key is used and there's an RPC.
    // However, for tables, we often use the Supabase Dashboard. 
    // BUT we can at least try to see if the table exists or just log.

    // Instead, I'll use a direct "SELECT" check to see if we have access.
    try {
        const { data, error } = await supabase.from('promo_codes').select('count', { count: 'exact', head: true });
        if (error) {
            console.log("❌ Table doesn't exist yet, please run the SQL in your Supabase dashboard or I'll attempt a direct insert if it's already created by a previous agent.");
            return;
        }
        console.log("✅ Promo Code table already exists and is accessible!");
    } catch (e) {
        console.error("Migration check failed:", e);
    }
}

migrate();
