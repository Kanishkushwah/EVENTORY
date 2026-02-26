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

    // Register a new user using raw Supabase Auth API
    async registerUser(userData) {
        try {
            // 1. Create User in Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: userData.email,
                password: userData.password,
                options: {
                    data: {
                        name: userData.name
                    }
                }
            });

            if (authError) {
                return { error: authError };
            }

            // 2. Ensure user is also mirrored in the public 'users' table
            if (authData?.user) {
                const newUser = {
                    email: userData.email,
                    name: userData.name,
                    password: userData.password, // Stored purely for legacy backward compatibility
                    created_at: new Date().toISOString()
                };

                // Because of Supabase Auth triggers or restrictions, we try catch this part.
                await supabase.from('users').upsert([newUser], { onConflict: 'email' }).catch(e => console.log('Mirror Sync Alert:', e));
            }

            return authData.user || { email: userData.email, name: userData.name };

        } catch (error) {
            console.error("Register Error:", error);
            return { error };
        }
    },

    // Verify user credentials using Supabase Auth
    async verifyUser(email, password) {
        try {
            // 1. Attempt login with native Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (!authError && authData?.user) {
                // Return success via Supabase Auth
                return {
                    id: authData.user.id,
                    email: authData.user.email,
                    name: authData.user.user_metadata?.name || email.split('@')[0],
                    session_token: authData.session?.access_token
                };
            }

            // fallback for older users who registered before Supabase Auth module was enabled
            const { data: legacyData, error: legacyError } = await supabase
                .from('users')
                .select('*')
                .eq('email', email)
                .eq('password', password) // Legacy basic check
                .single();

            if (legacyError || !legacyData) {
                return { error: { message: authError?.message || "Invalid email or password" } };
            }

            return legacyData;

        } catch (error) {
            console.error("Login Verify Error:", error);
            return { error };
        }
    }
};
