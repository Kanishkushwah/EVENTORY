import { supabase } from "../config/supabase.js";

export const UserService = {

    // Get all bookings for a specific user by email
    async getUserBookings(email) {
        try {
            const { data, error } = await supabase
                .from('bookings')
                .select('*')
                .eq('user_email', email)
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Categorize bookings
            const now = new Date();
            const upcoming = [];
            const past = [];

            data.forEach(booking => {
                const eventDate = new Date(booking.event_date);
                if (eventDate >= now) {
                    upcoming.push(booking);
                } else {
                    past.push(booking);
                }
            });

            return {
                all: data,
                upcoming,
                past,
                total: data.length
            };

        } catch (error) {
            console.error("Get User Bookings Error:", error);
            return { error };
        }
    },

    // Get booking statistics for a user
    async getUserStats(email) {
        try {
            const { data, error } = await supabase
                .from('bookings')
                .select('amount_paid, payment_status')
                .eq('user_email', email);

            if (error) throw error;

            const totalSpent = data
                .filter(b => b.payment_status === 'confirmed')
                .reduce((sum, b) => sum + (b.amount_paid || 0), 0);

            return {
                totalBookings: data.length,
                confirmedBookings: data.filter(b => b.payment_status === 'confirmed').length,
                totalSpent
            };

        } catch (error) {
            console.error("Get User Stats Error:", error);
            return { error };
        }
    },

    // Register a new user
    async registerUser(userData) {
        try {
            // Check if user exists
            const { data: existingUser } = await supabase
                .from('users')
                .select('*')
                .eq('email', userData.email)
                .single();

            if (existingUser) {
                return { error: { message: "User already exists with this email" } };
            }

            const newUser = {
                name: userData.name,
                email: userData.email,
                password: userData.password, // In production, hash this!
                created_at: new Date().toISOString()
            };

            const { data, error } = await supabase
                .from('users')
                .insert([newUser])
                .select()
                .single();

            if (error) throw error;
            return data;

        } catch (error) {
            console.error("Register Error:", error);
            return { error };
        }
    },

    // Verify user credentials (Login)
    async verifyUser(email, password) {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('email', email)
                .eq('password', password) // Basic check
                .single();

            if (error || !data) {
                return { error: { message: "Invalid email or password" } };
            }

            return data;

        } catch (error) {
            console.error("Login Verify Error:", error);
            return { error };
        }
    }
};
