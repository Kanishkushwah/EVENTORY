import { BookingService } from "../services/booking.service.js";

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
  }
};