import { supabase } from "./src/config/supabase.js";
import 'dotenv/config';

async function testSupabase() {
    console.log("Testing Supabase Connection...");
    try {
        const { data, error } = await supabase.from('events').select('*').limit(1);
        if (error) {
            console.error("Supabase Error Data:", error);
        } else {
            console.log("Supabase Connection Successful! Data:", data);
        }
    } catch (err) {
        console.error("Connection Threw Error:", err);
    }
}

testSupabase();
