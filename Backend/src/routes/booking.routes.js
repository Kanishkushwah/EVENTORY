import express from "express";
import { BookingController } from "../controllers/booking.controller.js";

const router = express.Router();

// Create a new booking (before payment)
router.post("/create", BookingController.createBooking);

// Fetch occupied seats for an event or showtime
router.get("/occupied-seats", BookingController.getOccupiedSeats);

// Fetch booking by reference (used on payment confirmation page)
router.get("/:reference", BookingController.getBookingByReference);

// Lock / Unlock seats live
router.post("/lock-seat", BookingController.lockSeat);
router.post("/unlock-seat", BookingController.unlockSeat);

export default router;