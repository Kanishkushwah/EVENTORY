import { supabase } from "../config/supabase.js";

export const UserModel = {
    async create(user) {
        return await supabase.from("users").insert([user]);
    },

    async getByEmail(email) {
        return await supabase
            .from("users")
            .select("*")
            .eq("email", email)
            .single();
    },

    async updatePreferences(email, preferences) {
        return await supabase
            .from("users")
            .update({ preferences })
            .eq("email", email);
    }
};