import { UserService } from "../services/user.service.js";

export const UserController = {

    // Get all bookings for a user
    async getUserBookings(req, res) {
        try {
            const email = req.params.email;

            if (!email) {
                return res.status(400).json({ message: "Email is required" });
            }

            const result = await UserService.getUserBookings(email);

            if (result.error) {
                return res.status(500).json({ message: "Failed to fetch bookings", error: result.error.message });
            }

            return res.json(result);

        } catch (err) {
            console.error("Get User Bookings Error:", err);
            return res.status(500).json({ message: "Internal Server Error" });
        }
    },

    // Get user statistics
    async getUserStats(req, res) {
        try {
            const email = req.params.email;

            if (!email) {
                return res.status(400).json({ message: "Email is required" });
            }

            const result = await UserService.getUserStats(email);

            if (result.error) {
                return res.status(500).json({ message: "Failed to fetch stats", error: result.error.message });
            }

            return res.json(result);

        } catch (err) {
            console.error("Get User Stats Error:", err);
            return res.status(500).json({ message: "Internal Server Error" });
        }
    }
};
