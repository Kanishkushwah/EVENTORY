import express from 'express';
import { supabase } from '../config/supabase.js';

const router = express.Router();

// ============================================
// BOOKING CANCELLATION ROUTES
// ============================================

// GET /api/bookings/:reference/cancellation-policy - Check cancellation policy
router.get('/:reference/cancellation-policy', async (req, res) => {
    try {
        // Get booking details
        const { data: booking, error } = await supabase
            .from('bookings')
            .select(`
                *,
                showtime:movie_showtimes(show_date, show_time)
            `)
            .eq('reference', req.params.reference)
            .single();

        if (error) throw error;

        // Check if already cancelled
        if (booking.booking_status === 'cancelled') {
            return res.json({
                can_cancel: false,
                message: 'Booking is already cancelled'
            });
        }

        // Calculate time difference
        const showDateTime = booking.showtime
            ? new Date(`${booking.showtime.show_date}T${booking.showtime.show_time}`)
            : new Date(booking.event_date); // Fallback for non-movie events

        const now = new Date();
        const hoursDifference = (showDateTime - now) / (1000 * 60 * 60);

        let refundPercentage = 0;
        let policy = '';

        if (hoursDifference >= 24) {
            refundPercentage = 100;
            policy = 'Full refund (100%) - Cancelled more than 24 hours before show';
        } else if (hoursDifference >= 12) {
            refundPercentage = 50;
            policy = 'Partial refund (50%) - Cancelled 12-24 hours before show';
        } else if (hoursDifference >= 2) {
            refundPercentage = 25;
            policy = 'Minimal refund (25%) - Cancelled 2-12 hours before show';
        } else if (hoursDifference > 0) {
            refundPercentage = 0;
            policy = 'No refund - Cancelled less than 2 hours before show';
        } else {
            return res.json({
                can_cancel: false,
                message: 'Cannot cancel past events'
            });
        }

        const refundAmount = (booking.amount_paid * refundPercentage) / 100;

        res.json({
            can_cancel: true,
            refund_percentage: refundPercentage,
            refund_amount: refundAmount,
            policy,
            show_time: showDateTime,
            hours_until_show: Math.round(hoursDifference * 10) / 10
        });

    } catch (err) {
        console.error('Error checking cancellation policy:', err);
        res.status(500).json({ error: 'Failed to check cancellation policy' });
    }
});

// POST /api/bookings/:reference/cancel - Cancel booking
router.post('/:reference/cancel', async (req, res) => {
    try {
        const { reason } = req.body;

        // Get booking with showtime details
        const { data: booking, error: fetchError } = await supabase
            .from('bookings')
            .select(`
                *,
                showtime:movie_showtimes(show_date, show_time, id, available_seats)
            `)
            .eq('reference', req.params.reference)
            .single();

        if (fetchError) throw fetchError;

        // Check if already cancelled
        if (booking.booking_status === 'cancelled') {
            return res.status(400).json({ error: 'Booking is already cancelled' });
        }

        // Calculate refund
        const showDateTime = booking.showtime
            ? new Date(`${booking.showtime.show_date}T${booking.showtime.show_time}`)
            : new Date(booking.event_date);

        const now = new Date();
        const hoursDifference = (showDateTime - now) / (1000 * 60 * 60);

        let refundPercentage = 0;
        if (hoursDifference >= 24) refundPercentage = 100;
        else if (hoursDifference >= 12) refundPercentage = 50;
        else if (hoursDifference >= 2) refundPercentage = 25;

        if (hoursDifference <= 0) {
            return res.status(400).json({ error: 'Cannot cancel past events' });
        }

        const refundAmount = (booking.amount_paid * refundPercentage) / 100;

        // Update booking status
        const { data: updatedBooking, error: updateError } = await supabase
            .from('bookings')
            .update({
                booking_status: 'cancelled',
                cancelled_at: new Date().toISOString(),
                cancellation_reason: reason || 'No reason provided',
                refund_status: refundPercentage > 0 ? 'processed' : 'none',
                refund_amount: refundAmount
            })
            .eq('reference', req.params.reference)
            .select()
            .single();

        if (updateError) throw updateError;

        // Return seats to showtime if it's a movie booking
        if (booking.showtime_id && booking.showtime) {
            const newAvailableSeats = booking.showtime.available_seats + booking.seats.length;
            await supabase
                .from('movie_showtimes')
                .update({ available_seats: newAvailableSeats })
                .eq('id', booking.showtime_id);
        }

        res.json({
            success: true,
            booking: updatedBooking,
            refund_amount: refundAmount,
            refund_percentage: refundPercentage,
            refund_status: refundPercentage > 0 ? 'processed' : 'none',
            message: refundPercentage > 0
                ? `Booking cancelled. Refund of ₹${refundAmount.toFixed(2)} has been initiated.`
                : 'Booking cancelled. No refund applicable.'
        });

    } catch (err) {
        console.error('Error cancelling booking:', err);
        res.status(500).json({ error: 'Failed to cancel booking' });
    }
});

// GET /api/bookings/cancelled - Get all cancelled bookings (Admin)
router.get('/cancelled/all', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('bookings')
            .select('*')
            .eq('booking_status', 'cancelled')
            .order('cancelled_at', { ascending: false });

        if (error) throw error;

        res.json(data);
    } catch (err) {
        console.error('Error fetching cancelled bookings:', err);
        res.status(500).json({ error: 'Failed to fetch cancelled bookings' });
    }
});

export default router;
