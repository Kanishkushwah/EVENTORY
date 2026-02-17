import { supabase } from "../config/supabase.js";

export const SeatModel = {
    async create(seat) {
        return await supabase.from("seats").insert([seat]);
    },

    async getByEvent(event_id) {
        return await supabase
            .from("seats")
            .select("*")
            .eq("event_id", event_id);
    },

    async updateStatus(id, status) {
        return await supabase
            .from("seats")
            .update({ status })
            .eq("id", id);
    }
};