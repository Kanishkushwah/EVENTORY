import { EventService } from "../services/event.service.js";
import { EventModel } from "../models/event.model.js";

export const EventController = {
    /**
     * Get all events from database
     */
    async getEvents(req, res) {
        try {
            const { data, error } = await EventModel.getAll();

            if (error) {
                console.error("Get Events Error:", error);
                return res.status(500).json({
                    message: "Failed to fetch events",
                    error: error.message
                });
            }

            res.json(data || []);
        } catch (err) {
            console.error("Get Events Controller Error:", err);
            res.status(500).json({ message: "Internal server error" });
        }
    },

    /**
     * Get single event by ID
     */
    async getEventById(req, res) {
        try {
            const { id } = req.params;
            const { data, error } = await EventModel.getById(id);

            if (error) {
                return res.status(500).json({ message: "Failed to fetch event", error: error.message });
            }

            if (!data) {
                return res.status(404).json({ message: "Event not found" });
            }

            res.json(data);
        } catch (err) {
            console.error("Get Event By ID Error:", err);
            res.status(500).json({ message: "Internal server error" });
        }
    },

    /**
     * Create new event
     */
    async createEvent(req, res) {
        try {
            const eventData = req.body;
            const { data, error } = await EventModel.create(eventData);

            if (error) {
                return res.status(400).json({ message: "Failed to create event", error: error.message });
            }

            res.status(201).json({ message: "Event created successfully", event: data });
        } catch (err) {
            console.error("Create Event Error:", err);
            res.status(500).json({ message: "Internal server error" });
        }
    },

    /**
     * Fetch and store events from Ticketmaster API
     */
    async autoUpdateEvents(req, res) {
        try {
            const result = await EventService.fetchAndStoreEvents();
            res.json(result);
        } catch (error) {
            console.error("Auto Update Events Error:", error);
            res.status(500).json({
                message: "Failed to update events",
                error: error.message
            });
        }
    }
};