import { AdminService } from "../services/admin.service.js";

export const AdminController = {
    // Login
    login(req, res) {
        const { email, password } = req.body;

        if (
            email === process.env.ADMIN_EMAIL &&
            password === process.env.ADMIN_PASSWORD
        ) {
            return res.json({ success: true, message: "Admin login successful" });
        }

        res.status(401).json({ success: false, message: "Invalid credentials" });
    },

    // Get dashboard statistics
    async getDashboardStats(req, res) {
        try {
            const stats = await AdminService.getDashboardStats();

            if (stats.error) {
                return res.status(500).json({ message: "Failed to fetch stats", error: stats.error.message });
            }

            return res.json(stats);

        } catch (err) {
            console.error("Get Stats Error:", err);
            return res.status(500).json({ message: "Internal Server Error" });
        }
    },

    // Get all bookings with pagination and filters
    async getAllBookings(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const filters = {
                search: req.query.search,
                status: req.query.status,
                eventTitle: req.query.eventTitle
            };

            const result = await AdminService.getAllBookings(page, limit, filters);

            if (result.error) {
                return res.status(500).json({ message: "Failed to fetch bookings", error: result.error.message });
            }

            return res.json(result);

        } catch (err) {
            console.error("Get All Bookings Error:", err);
            return res.status(500).json({ message: "Internal Server Error" });
        }
    },

    // Create event
    async createEvent(req, res) {
        try {
            const eventData = req.body;

            const result = await AdminService.createEvent(eventData);

            if (result.error) {
                return res.status(400).json({ message: "Failed to create event", error: result.error.message });
            }

            return res.json({ message: "Event created successfully", event: result.event });

        } catch (err) {
            console.error("Create Event Error:", err);
            return res.status(500).json({ message: "Internal Server Error" });
        }
    },

    // Update event
    async updateEvent(req, res) {
        try {
            const eventId = req.params.id;
            const updateData = req.body;

            const result = await AdminService.updateEvent(eventId, updateData);

            if (result.error) {
                return res.status(400).json({ message: "Failed to update event", error: result.error.message });
            }

            return res.json({ message: "Event updated successfully", event: result.event });

        } catch (err) {
            console.error("Update Event Error:", err);
            return res.status(500).json({ message: "Internal Server Error" });
        }
    },

    // Delete event
    async deleteEvent(req, res) {
        try {
            const eventId = req.params.id;

            const result = await AdminService.deleteEvent(eventId);

            if (result.error) {
                return res.status(400).json({ message: "Failed to delete event", error: result.error.message });
            }

            return res.json({ message: "Event deleted successfully" });

        } catch (err) {
            console.error("Delete Event Error:", err);
            return res.status(500).json({ message: "Internal Server Error" });
        }
    }
};