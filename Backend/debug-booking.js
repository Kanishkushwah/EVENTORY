import { supabase } from "./src/config/supabase.js";
import dotenv from "dotenv";

dotenv.config();

async function checkEvent() {
    console.log("Checking Event...");
    const eventId = 6;

    try {
        const { data, error } = await supabase
            .from("events")
            .select("*")
            .eq("id", eventId)
            .single();

        if (error) {
            console.error("❌ DB Error:", error.message);
            return;
        }

        if (!data) {
            console.log("⚠️ Event not found.");
            return;
        }

        console.log("✅ Event Found:", data);
        console.log("CATEGORY:", data.category);

    } catch (err) {
        console.error("❌ Unexpected Error:", err);
    }
}

checkEvent();
