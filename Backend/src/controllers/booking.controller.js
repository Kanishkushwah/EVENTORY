import { BookingService } from "../services/booking.service.js";
import { EmailService } from "../services/email.service.js";
import { PdfService } from "../services/pdf.service.js";
import { QRService } from "../services/qr.service.js";

export const BookingController = {

    // 1️⃣ CREATE BOOKING (before payment)
    async createBooking(req, res) {
        try {
            const bookingData = req.body;

            const result = await BookingService.createBooking(bookingData);

            if (result.error) {
                return res.status(400).json({ message: result.error.message });
            }

            // Return full booking details to frontend
            return res.json({
                message: "Booking created successfully",
                reference: result.reference,
                event_title: result.event_title,
                event_date: result.event_date,
                event_time: result.event_time,
                venue: result.venue,
                seats: result.seats,
                amount_paid: result.amount_paid,
                user_email: result.user_email
            });

        } catch (err) {
            console.error("Create Booking Error:", err);
            return res.status(500).json({ message: "Internal Server Error" });
        }
    },

    // 2️⃣ FETCH BOOKING BY REFERENCE (for confirmation page & ticket)
    async getBookingByReference(req, res) {
        try {
            const reference = req.params.reference;

            const booking = await BookingService.getBookingByReference(reference);

            if (!booking) {
                return res.status(404).json({ message: "Booking not found" });
            }

            return res.json(booking);

        } catch (err) {
            console.error("Fetch Booking Error:", err);
            return res.status(500).json({ message: "Internal Server Error" });
        }
    },

    // 3️⃣ FETCH OCCUPIED SEATS
    async getOccupiedSeats(req, res) {
        try {
            const { event_id, showtime_id } = req.query;

            if (!event_id) {
                return res.status(400).json({ message: "event_id is required" });
            }

            const result = await BookingService.getOccupiedSeats(event_id, showtime_id);

            if (result.error) {
                return res.status(500).json({ message: "Failed to fetch occupied seats" });
            }

            return res.json({
                occupied: result.occupied || [],
                locked: result.locked || [],
                lockedBy: result.lockedBy || {}
            });

        } catch (err) {
            console.error("Fetch Occupied Seats Error:", err);
            return res.status(500).json({ message: "Internal Server Error" });
        }
    },

    // 4️⃣ LOCK SEAT
    async lockSeat(req, res) {
        try {
            const { event_id, showtime_id, seat, user_id } = req.body;
            if (!event_id || !seat || !user_id) return res.status(400).json({ message: "Missing required fields" });

            const result = await BookingService.lockSeat(event_id, showtime_id, seat, user_id);
            if (result.error) return res.status(400).json({ message: result.error.message || result.error || "Failed to lock seat" });
            return res.json({ success: true, message: "Seat locked" });
        } catch (err) {
            return res.status(500).json({ message: "Internal Server Error" });
        }
    },

    // 5️⃣ UNLOCK SEAT
    async unlockSeat(req, res) {
        try {
            const { event_id, showtime_id, seat, user_id } = req.body;
            if (!event_id || !seat || !user_id) return res.status(400).json({ message: "Missing required fields" });

            await BookingService.unlockSeat(event_id, showtime_id, seat, user_id);
            return res.json({ success: true, message: "Seat unlocked" });
        } catch (err) {
            return res.status(500).json({ message: "Internal Server Error" });
        }
    },

    // 6️⃣ RESEND EMAIL
    async resendEmail(req, res) {
        try {
            const { reference } = req.body;
            if (!reference) return res.status(400).json({ message: "Reference is required" });

            const booking = await BookingService.getBookingByReference(reference);
            if (!booking) return res.status(404).json({ message: "Booking not found" });

            if (booking.payment_status !== 'completed') {
                return res.status(400).json({ message: "Email can only be sent for completed bookings" });
            }

            const qrDataUrl = await QRService.generateQR(reference);
            const pdfBuffer = await PdfService.generateTicketPDF(booking, qrDataUrl);

            await EmailService.sendBookingEmail(booking.user_email, booking, pdfBuffer);

            return res.json({ success: true, message: "Email resent successfully!" });
        } catch (err) {
            console.error("Resend Email Error:", err);
            return res.status(500).json({ message: "Failed to resend email: " + err.message });
        }
    }
};