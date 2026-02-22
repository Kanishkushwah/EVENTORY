import { supabase } from "../config/supabase.js";

export const BookingModel = {
    async create(data) {
        const { data: inserted, error } = await supabase
            .from("bookings")
            .insert([data])
            .select()
            .single();

        return { data: inserted, error };
    },

    async update(reference, updateFields) {
        const { data, error } = await supabase
            .from("bookings")
            .update(updateFields)
            .eq("reference", reference)
            .select()
            .single();

        return { data, error };
    },

    async getByReference(reference) {
        const { data, error } = await supabase
            .from("bookings")
            .select("*")
            .eq("reference", reference)
            .single();
        return { data, error };
    },

    async getOccupiedSeats(eventId, showtimeId = null) {
        let query = supabase
            .from("bookings")
            .select("seats")
            .eq("event_id", eventId)
            // Ideally only payment_status === "completed" but we can include pending to prevent racing
            .in("payment_status", ["completed", "pending"]);

        if (showtimeId) {
            query = query.eq("showtime_id", showtimeId);
        }

        const { data, error } = await query;
        return { data, error };
    }
};