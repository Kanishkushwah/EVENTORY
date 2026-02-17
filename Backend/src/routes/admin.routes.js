import express from "express";
import { AdminController } from "../controllers/admin.controller.js";

const router = express.Router();

// Authentication
router.post("/login", AdminController.login);

// Dashboard stats
router.get("/stats", AdminController.getDashboardStats);

// Bookings management
router.get("/bookings", AdminController.getAllBookings);

// Event management
router.post("/events", AdminController.createEvent);
router.put("/events/:id", AdminController.updateEvent);
router.delete("/events/:id", AdminController.deleteEvent);

export default router;