import { BookingModel } from "../models/booking.model.js";
import { generateBookingReference } from "../utils/referenceGenerator.js";

export const BookingService = {
    async createBooking(bookingData) {
        const reference = generateBookingReference();
        const timestamp = new Date().toISOString();

        const record = {
            // DB column is `reference`
            reference,
            event_id: bookingData.event_id,
            event_title: bookingData.event_title,
            event_date: bookingData.event_date,
            event_time: bookingData.event_time,
            venue: bookingData.venue,
            user_email: bookingData.user_email,
            seats: bookingData.seats,
            amount_paid: bookingData.amount_paid,
            event_type: bookingData.event_type || null,
            poster_url: bookingData.poster_url || null,
            payment_status: "pending",
            payment_method: null,
            cinema_id: bookingData.cinema_id || null,
            showtime_id: bookingData.showtime_id || null,
            created_at: timestamp,
            updated_at: timestamp,
        };

        const { data, error } = await BookingModel.create(record);

        if (error) {
            console.error("Create Booking Error:", error);
            return { error };
        }

        return data;
    },

    async getBookingByReference(reference) {
        const { data, error } = await BookingModel.getByReference(reference);

        if (error) {
            console.error("Get Booking Error:", error);
            return null;
        }

        return data;
    },

    async updatePaymentStatus(reference, payment_method) {
        const { data, error } = await BookingModel.update(reference, {
            payment_status: "completed",
            payment_method,
            updated_at: new Date().toISOString(),
        });

        if (error) {
            console.error("Update Payment Error:", error);
            return { error };
        }

        return data;
    },

    async getOccupiedSeats(eventId, showtimeId = null) {
        const { data, error } = await BookingModel.getOccupiedSeats(eventId, showtimeId);

        if (error) {
            console.error("Get Occupied Seats Error:", error);
            return { error };
        }

        // Flatten the array of seat arrays
        const occupied = [];
        data.forEach(booking => {
            if (booking.seats && Array.isArray(booking.seats)) {
                occupied.push(...booking.seats);
            }
        });

        return { occupied };
    }
};