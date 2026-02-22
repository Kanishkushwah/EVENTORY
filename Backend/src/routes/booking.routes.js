import express from "express";
import { BookingController } from "../controllers/booking.controller.js";

const router = express.Router();

// Create a new booking (before payment)
router.post("/create", BookingController.createBooking);

// Fetch occupied seats for an event or showtime
router.get("/occupied-seats", BookingController.getOccupiedSeats);

// Fetch booking by reference (used on payment confirmation page)
router.get("/:reference", BookingController.getBookingByReference);

export default router;