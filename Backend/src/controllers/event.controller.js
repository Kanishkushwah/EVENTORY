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
     * AI-Powered Smart Discovery Engine
     */
    async smartSearch(req, res) {
        try {
            const query = (req.query.q || "").toLowerCase();
            if (!query) return res.json([]);

            const { data: events, error } = await EventModel.getAll();
            if (error || !events) return res.status(500).json({ message: "DB Error" });

            // Basic NLP Information Extraction
            const budgetMatch = query.match(/(under|below|max|cheap|budget|₹|rs)?\s*(\d+)/i);
            const budget = budgetMatch ? parseInt(budgetMatch[2]) : null;

            const isRomantic = query.includes("romantic") || query.includes("date") || query.includes("couple");
            const isFunny = query.includes("funny") || query.includes("laugh") || query.includes("comedy") || query.includes("standup");
            const isMusic = query.includes("music") || query.includes("concert") || query.includes("sing") || query.includes("dj");
            const isSport = query.includes("sport") || query.includes("cricket") || query.includes("match");
            const isMovie = query.includes("movie") || query.includes("film") || query.includes("cinema");

            // Scoring Algorithm
            const scoredEvents = events.map(event => {
                let score = 0;
                const title = (event.title || "").toLowerCase();
                const desc = (event.description || "").toLowerCase();
                const cat = (event.category || "").toLowerCase();

                // Budget check
                if (budget) {
                    if (event.price <= budget) score += 3;
                    else score -= 5; // Penalty for being over budget
                } else if (query.includes("free") && event.price === 0) {
                    score += 5;
                }

                // Intent matching
                if (isRomantic && (desc.includes("romantic") || cat === "music" || cat === "movies")) score += 2;
                if (isFunny && (cat === "comedy" || cat === "standup" || desc.includes("laugh"))) score += 3;
                if (isMusic && (cat === "music" || cat === "concert")) score += 3;
                if (isSport && (cat === "sports" || cat === "sport" || cat === "cricket")) score += 3;
                if (isMovie && (cat === "movies" || cat === "movie")) score += 3;

                // Keyword matching
                const words = query.split(/\s+/).filter(w => w.length > 3);
                words.forEach(word => {
                    if (title.includes(word)) score += 2;
                    if (desc.includes(word)) score += 1;
                    if (event.venue && event.venue.toLowerCase().includes(word)) score += 2;
                });

                return { ...event, _matchScore: score };
            });

            // Filter out totally irrelevant things (score < 1 unless nothing matched)
            let results = scoredEvents.filter(e => e._matchScore > 0);

            // Sort by highest score
            results.sort((a, b) => b._matchScore - a._matchScore);

            res.json(results.slice(0, 6)); // Return Top 6 matches
        } catch (err) {
            console.error("Smart Search Error:", err);
            res.status(500).json({ message: "Engine error" });
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