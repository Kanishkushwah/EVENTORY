import { supabase } from "../config/supabase.js";

export const EventModel = {
    async getAll() {
        return await supabase
            .from("events")
            .select("*")
            .order("id", { ascending: false });
    },

    async getById(id) {
        return await supabase
            .from("events")
            .select("*")
            .eq("id", id)
            .single();
    },

    async create(eventData) {
        return await supabase
            .from("events")
            .insert(eventData)
            .select()
            .single();
    },

    async update(id, eventData) {
        return await supabase
            .from("events")
            .update(eventData)
            .eq("id", id)
            .select()
            .single();
    },

    async delete(id) {
        return await supabase
            .from("events")
            .delete()
            .eq("id", id);
    }
};