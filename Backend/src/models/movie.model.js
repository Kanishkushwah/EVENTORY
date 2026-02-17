import { supabase } from "../config/supabase.js";

export const MovieModel = {
    async getAll() {
        return await supabase
            .from("movies")
            .select("*")
            .order("id", { ascending: false });
    },

    async getById(id) {
        return await supabase
            .from("movies")
            .select("*")
            .eq("id", id)
            .single();
    },

    async getByTmdbId(tmdbId) {
        return await supabase
            .from("movies")
            .select("*")
            .eq("tmdb_id", tmdbId)
            .single();
    },

    async create(movieData) {
        return await supabase
            .from("movies")
            .insert(movieData)
            .select()
            .single();
    },

    async exists(title) {
        const { data, error } = await supabase
            .from("movies")
            .select("id")
            .eq("title", title)
            .single();

        return !!data && !error;
    },

    async delete(id) {
        return await supabase
            .from("movies")
            .delete()
            .eq("id", id);
    }
};