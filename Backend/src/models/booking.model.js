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
        // Calculate the timestamp for 5 minutes ago to ignore abandoned/expired locks
        const fiveMinsAgo = new Date(Date.now() - 5 * 60000).toISOString();

        // We use .or to get either completed OR (pending/locked AND newer than 5 mins)
        let query = supabase
            .from("bookings")
            .select("seats, payment_status, user_email")
            .eq("event_id", eventId)
            .or(`payment_status.eq.completed,and(payment_status.in.(pending,locked),created_at.gte.${fiveMinsAgo})`);

        if (showtimeId) {
            query = query.eq("showtime_id", showtimeId);
        }

        const { data, error } = await query;
        if (error) return { data: null, error };

        let occupied = [];
        let locked = [];
        let lockedBy = {};

        data.forEach(booking => {
            if (booking.payment_status === "completed") {
                occupied.push(...booking.seats);
            } else {
                locked.push(...booking.seats);
                booking.seats.forEach(s => { lockedBy[s] = booking.user_email; });
            }
        });

        return { data: { occupied, locked, lockedBy }, error: null };
    },

    async deleteLockedSeat(reference) {
        return await supabase
            .from("bookings")
            .delete()
            .eq("reference", reference)
            .eq("payment_status", "locked");
    }
};