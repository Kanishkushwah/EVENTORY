import express from "express";
import { UserController } from "../controllers/user.controller.js";

const router = express.Router();

// Get user bookings
router.get("/bookings/:email", UserController.getUserBookings);

// Get user statistics
router.get("/stats/:email", UserController.getUserStats);

export default router;
