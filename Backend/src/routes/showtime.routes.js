import express from 'express';
import { supabase } from '../config/supabase.js';

const router = express.Router();

// ============================================
// SHOWTIME ROUTES
// ============================================

// GET /api/showtimes/movie/:eventId - Get all showtimes for a movie
router.get('/movie/:eventId', async (req, res) => {
    try {
        const { date } = req.query; // Optional date filter

        let query = supabase
            .from('movie_showtimes')
            .select(`
                *,
                cinema:cinemas(id, name, location, address, city),
                event:events(id, title, image_url)
            `)
            .eq('event_id', req.params.eventId)
            .order('show_date')
            .order('show_time');

        if (date) {
            query = query.eq('show_date', date);
        }

        let { data, error } = await query;

        if (error) throw error;

        // Auto-Generate Showtimes if none exist
        if (data.length === 0 && !date) {
            console.log(`Auto-generating showtimes for movie ${req.params.eventId}`);
            const { data: cinemas } = await supabase.from('cinemas').select('id, name, location, address, city');
            const { data: eventData } = await supabase.from('events').select('id, title, image_url, price').eq('id', req.params.eventId).single();

            if (cinemas && cinemas.length > 0 && eventData) {
                const newShowtimes = [];
                const basePrice = eventData.price || 200;

                for (let i = 0; i < 5; i++) {
                    const d = new Date();
                    d.setDate(d.getDate() + i);
                    const ds = d.toISOString().split('T')[0];

                    for (const c of cinemas) {
                        newShowtimes.push({ event_id: req.params.eventId, cinema_id: c.id, show_date: ds, show_time: '10:00 AM', screen_number: 1, available_seats: 100, price: basePrice });
                        newShowtimes.push({ event_id: req.params.eventId, cinema_id: c.id, show_date: ds, show_time: '02:30 PM', screen_number: 2, available_seats: 100, price: basePrice + 50 });
                        newShowtimes.push({ event_id: req.params.eventId, cinema_id: c.id, show_date: ds, show_time: '07:00 PM', screen_number: 1, available_seats: 100, price: basePrice + 100 });
                    }
                }

                await supabase.from('movie_showtimes').insert(newShowtimes);

                // Re-fetch to guarantee standard populated structure
                const { data: refetchData } = await supabase
                    .from('movie_showtimes')
                    .select(`*, cinema:cinemas(id, name, location, address, city), event:events(id, title, image_url)`)
                    .eq('event_id', req.params.eventId)
                    .order('show_date')
                    .order('show_time');
                if (refetchData) data = refetchData;
            }
        }

        // Group by cinema
        const groupedByCinema = data.reduce((acc, showtime) => {
            const cinemaId = showtime.cinema.id;
            if (!acc[cinemaId]) {
                acc[cinemaId] = {
                    cinema: showtime.cinema,
                    showtimes: []
                };
            }
            acc[cinemaId].showtimes.push({
                id: showtime.id,
                show_date: showtime.show_date,
                show_time: showtime.show_time,
                screen_number: showtime.screen_number,
                available_seats: showtime.available_seats,
                price: showtime.price
            });
            return acc;
        }, {});

        res.json(Object.values(groupedByCinema));
    } catch (err) {
        console.error('Error fetching showtimes:', err);
        res.status(500).json({ error: 'Failed to fetch showtimes' });
    }
});

// GET /api/showtimes/cinema/:cinemaId - Get all movies/showtimes at a cinema
router.get('/cinema/:cinemaId', async (req, res) => {
    try {
        const { date } = req.query;

        let query = supabase
            .from('movie_showtimes')
            .select(`
                *,
                event:events(id, title, image_url, category)
            `)
            .eq('cinema_id', req.params.cinemaId)
            .order('show_date')
            .order('show_time');

        if (date) {
            query = query.eq('show_date', date);
        }

        const { data, error } = await query;

        if (error) throw error;

        // Group by movie
        const groupedByMovie = data.reduce((acc, showtime) => {
            const eventId = showtime.event.id;
            if (!acc[eventId]) {
                acc[eventId] = {
                    event: showtime.event,
                    showtimes: []
                };
            }
            acc[eventId].showtimes.push({
                id: showtime.id,
                show_date: showtime.show_date,
                show_time: showtime.show_time,
                screen_number: showtime.screen_number,
                available_seats: showtime.available_seats,
                price: showtime.price
            });
            return acc;
        }, {});

        res.json(Object.values(groupedByMovie));
    } catch (err) {
        console.error('Error fetching cinema showtimes:', err);
        res.status(500).json({ error: 'Failed to fetch showtimes' });
    }
});

// GET /api/showtimes/:id - Get specific showtime details
router.get('/:id', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('movie_showtimes')
            .select(`
                *,
                cinema:cinemas(*),
                event:events(*)
            `)
            .eq('id', req.params.id)
            .single();

        if (error) throw error;

        res.json(data);
    } catch (err) {
        console.error('Error fetching showtime:', err);
        res.status(404).json({ error: 'Showtime not found' });
    }
});

// POST /api/showtimes - Create new showtime (Admin only)
router.post('/', async (req, res) => {
    try {
        const { event_id, cinema_id, show_date, show_time, screen_number, available_seats, price } = req.body;

        const { data, error } = await supabase
            .from('movie_showtimes')
            .insert([{
                event_id,
                cinema_id,
                show_date,
                show_time,
                screen_number,
                available_seats: available_seats || 100,
                price
            }])
            .select()
            .single();

        if (error) throw error;

        res.status(201).json(data);
    } catch (err) {
        console.error('Error creating showtime:', err);
        res.status(500).json({ error: 'Failed to create showtime' });
    }
});

// POST /api/showtimes/bulk - Create multiple showtimes (Admin only)
router.post('/bulk', async (req, res) => {
    try {
        const { showtimes } = req.body; // Array of showtime objects

        const { data, error } = await supabase
            .from('movie_showtimes')
            .insert(showtimes)
            .select();

        if (error) throw error;

        res.status(201).json({
            message: `${data.length} showtimes created`,
            data
        });
    } catch (err) {
        console.error('Error creating bulk showtimes:', err);
        res.status(500).json({ error: 'Failed to create showtimes' });
    }
});

// PUT /api/showtimes/:id - Update showtime (Admin only)
router.put('/:id', async (req, res) => {
    try {
        const { show_date, show_time, screen_number, available_seats, price } = req.body;

        const { data, error } = await supabase
            .from('movie_showtimes')
            .update({
                show_date,
                show_time,
                screen_number,
                available_seats,
                price
            })
            .eq('id', req.params.id)
            .select()
            .single();

        if (error) throw error;

        res.json(data);
    } catch (err) {
        console.error('Error updating showtime:', err);
        res.status(500).json({ error: 'Failed to update showtime' });
    }
});

// PATCH /api/showtimes/:id/seats - Update available seats (called during booking)
router.patch('/:id/seats', async (req, res) => {
    try {
        const { seatsBooked } = req.body;

        // Get current showtime
        const { data: showtime, error: fetchError } = await supabase
            .from('movie_showtimes')
            .select('available_seats')
            .eq('id', req.params.id)
            .single();

        if (fetchError) throw fetchError;

        const newAvailableSeats = showtime.available_seats - seatsBooked;

        if (newAvailableSeats < 0) {
            return res.status(400).json({ error: 'Not enough seats available' });
        }

        // Update
        const { data, error } = await supabase
            .from('movie_showtimes')
            .update({ available_seats: newAvailableSeats })
            .eq('id', req.params.id)
            .select()
            .single();

        if (error) throw error;

        res.json(data);
    } catch (err) {
        console.error('Error updating seats:', err);
        res.status(500).json({ error: 'Failed to update seats' });
    }
});

// DELETE /api/showtimes/:id - Delete showtime (Admin only)
router.delete('/:id', async (req, res) => {
    try {
        const { error } = await supabase
            .from('movie_showtimes')
            .delete()
            .eq('id', req.params.id);

        if (error) throw error;

        res.json({ message: 'Showtime deleted successfully' });
    } catch (err) {
        console.error('Error deleting showtime:', err);
        res.status(500).json({ error: 'Failed to delete showtime' });
    }
});

export default router;
