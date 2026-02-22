import { supabase } from "../config/supabase.js";

export const AdminService = {

    // Get dashboard statistics
    async getDashboardStats() {
        try {
            // Get total bookings
            const { data: bookings, error: bookingsError } = await supabase
                .from('bookings')
                .select('amount_paid, created_at, payment_status');

            if (bookingsError) throw bookingsError;

            // Get total events
            const { data: events, error: eventsError } = await supabase
                .from('events')
                .select('id');

            if (eventsError) throw eventsError;

            // Calculate revenue (only confirmed payments)
            const confirmedBookings = bookings.filter(b => b.payment_status === 'confirmed');
            const totalRevenue = confirmedBookings.reduce((sum, b) => sum + (b.amount_paid || 0), 0);

            // Get recent bookings (last 10)
            const { data: recentBookings, error: recentError } = await supabase
                .from('bookings')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(10);

            if (recentError) throw recentError;

            // Revenue by day (last 7 days)
            const revenueByDay = this.calculateRevenueByDay(confirmedBookings);

            return {
                totalRevenue,
                totalBookings: bookings.length,
                confirmedBookings: confirmedBookings.length,
                totalEvents: events.length,
                recentBookings,
                revenueByDay
            };

        } catch (error) {
            console.error("Get Stats Error:", error);
            return { error };
        }
    },

    // Calculate revenue by day for last 7 days
    calculateRevenueByDay(bookings) {
        const days = [];
        const now = new Date();

        for (let i = 6; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];

            const dayRevenue = bookings
                .filter(b => b.created_at && b.created_at.startsWith(dateStr))
                .reduce((sum, b) => sum + (b.amount_paid || 0), 0);

            days.push({
                date: dateStr,
                revenue: dayRevenue
            });
        }

        return days;
    },

    // Get all bookings with pagination and filters
    async getAllBookings(page = 1, limit = 20, filters = {}) {
        try {
            const offset = (page - 1) * limit;

            let query = supabase
                .from('bookings')
                .select('*', { count: 'exact' });

            // Apply filters
            if (filters.search) {
                query = query.or(`reference.ilike.%${filters.search}%,user_email.ilike.%${filters.search}%`);
            }

            if (filters.status) {
                query = query.eq('payment_status', filters.status);
            }

            if (filters.eventTitle) {
                query = query.ilike('event_title', `%${filters.eventTitle}%`);
            }

            // Pagination
            query = query
                .order('created_at', { ascending: false })
                .range(offset, offset + limit - 1);

            const { data, error, count } = await query;

            if (error) throw error;

            return {
                bookings: data,
                total: count,
                page,
                limit,
                totalPages: Math.ceil(count / limit)
            };

        } catch (error) {
            console.error("Get All Bookings Error:", error);
            return { error };
        }
    },

    // Create event
    // Create event with AUTOMATIC SHOWTIMES for movies
    async createEvent(eventData) {
        try {
            // AUTOMATIC NORMALIZATION
            // Ensure category is capitalized correctly (e.g. "movie" -> "Movies")
            let category = eventData.category;
            if (category.toLowerCase() === 'movie' || category.toLowerCase() === 'movies') category = 'Movies';
            if (category.toLowerCase() === 'music' || category.toLowerCase() === 'concert') category = 'Music';
            if (category.toLowerCase() === 'sports' || category.toLowerCase() === 'sport' || category.toLowerCase() === 'cricket') category = 'Sports';
            if (category.toLowerCase() === 'standup' || category.toLowerCase() === 'comedy') category = 'Standup';

            eventData.category = category;

            // 1. Create the event
            const { data, error } = await supabase
                .from('events')
                .insert([eventData])
                .select()
                .single();

            if (error) throw error;
            const event = data;

            // 2. AUTOMATIC SHOWTIME GENERATION FOR MOVIES
            if (category === 'Movies') {
                console.log(`🎬 Automatically generating showtimes for Movie: ${event.title}`);

                // Get default cinemas (or specific ones if you prefer)
                const { data: cinemas } = await supabase.from('cinemas').select('id, name');

                if (cinemas && cinemas.length > 0) {
                    const showtimes = [];
                    const today = new Date();
                    // Generate for today and next 2 days
                    for (let i = 0; i < 3; i++) {
                        const date = new Date(today);
                        date.setDate(date.getDate() + i);
                        const dateStr = date.toISOString().split('T')[0];

                        // Add 3 standard showtimes per cinema
                        cinemas.forEach(cinema => {
                            // Randomize times slightly for realism
                            showtimes.push({
                                event_id: event.id,
                                cinema_id: cinema.id,
                                show_date: dateStr,
                                show_time: '10:00 AM',
                                screen_number: 1,
                                price: event.price || 200, // Use event price or default
                                available_seats: 100
                            });
                            showtimes.push({
                                event_id: event.id,
                                cinema_id: cinema.id,
                                show_date: dateStr,
                                show_time: '02:00 PM',
                                screen_number: 2,
                                price: (event.price || 200) + 50, // Premium afternoon
                                available_seats: 120
                            });
                            showtimes.push({
                                event_id: event.id,
                                cinema_id: cinema.id,
                                show_date: dateStr,
                                show_time: '06:00 PM',
                                screen_number: 1,
                                price: (event.price || 200) + 100, // Peak evening
                                available_seats: 100
                            });
                        });
                    }

                    // Bulk insert showtimes
                    if (showtimes.length > 0) {
                        const { error: showtimeError } = await supabase
                            .from('movie_showtimes')
                            .insert(showtimes);

                        if (showtimeError) console.error("Auto-showtime generation failed:", showtimeError);
                        else console.log(`✅ Generated ${showtimes.length} showtimes for ${event.title}`);
                    }
                }
            }

            return { event: data };

        } catch (error) {
            console.error("Create Event Error:", error);
            return { error };
        }
    },

    // Update event
    async updateEvent(eventId, updateData) {
        try {
            const { data, error } = await supabase
                .from('events')
                .update(updateData)
                .eq('id', eventId)
                .select()
                .single();

            if (error) throw error;

            return { event: data };

        } catch (error) {
            console.error("Update Event Error:", error);
            return { error };
        }
    },

    // Delete event
    async deleteEvent(eventId) {
        try {
            const { error } = await supabase
                .from('events')
                .delete()
                .eq('id', eventId);

            if (error) throw error;

            return { success: true };

        } catch (error) {
            console.error("Delete Event Error:", error);
            return { error };
        }
    },

    // Verify Ticket Scanner
    async verifyTicket(reference) {
        try {
            const { data: booking, error } = await supabase.from('bookings').select('*').eq('reference', reference).single();
            if (error || !booking) return { error: "Invalid QR Code: Ticket not found!" };

            if (booking.payment_status !== 'completed') {
                return { error: `Ticket Payment Not Completed (${booking.payment_status})` };
            }

            // Simple robust local file system state to prevent double scans without DB migrations
            const fs = await import('fs');
            const path = await import('path');
            const scanLog = path.resolve('scanned_tickets.json');

            let scanned = [];
            if (fs.existsSync(scanLog)) {
                scanned = JSON.parse(fs.readFileSync(scanLog, 'utf8'));
            }

            if (scanned.includes(reference)) {
                return { error: "WARNING: Ticket has ALREADY been scanned!" };
            }

            scanned.push(reference);
            fs.writeFileSync(scanLog, JSON.stringify(scanned));

            return { message: "Ticket Verified - Access Granted!", booking };
        } catch (error) {
            console.error("Verify Ticket Logic Error:", error);
            return { error: error.message };
        }
    }
};
