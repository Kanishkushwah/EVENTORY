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
    }
};