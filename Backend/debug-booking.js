import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function checkBooking() {
    console.log("Checking Booking...");
    const ref = "EVT-20260219-ARDR70";

    try {
        const { data, error } = await supabase
            .from('bookings')
            .select('*')
            .eq('reference', ref)
            .single();

        if (error) {
            console.error("❌ Error fetching booking:", error);
            console.error("The booking likely does not exist or schema issue.");
        } else {
            console.log("✅ Booking Found:", data);
        }
    } catch (err) {
        console.error("Unexpected error:", err);
    }
}

checkBooking();
