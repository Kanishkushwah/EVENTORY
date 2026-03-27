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
                const venue = (event.venue || "").toLowerCase();

                // 1. Budget Processing
                if (budget) {
                    if (event.price <= budget) score += 20; // Budget match is important
                    else score -= 100; // Strict budget exclusion penalty
                } else if (query.includes("free") && event.price === 0) {
                    score += 30;
                }

                // 2. Intent Processing (Soft Matches & Fallbacks)
                let intentRequirementMet = true;

                if (isRomantic) {
                    if (title.includes("romantic") || title.includes("love") || title.includes("valentine") || desc.includes("romantic") || desc.includes("romance")) { score += 40; }
                    else { intentRequirementMet = false; }
                }
                if (isFunny) {
                    if (title.includes("comedy") || title.includes("standup") || title.includes("laugh") || cat === "comedy" || desc.includes("laugh") || desc.includes("comedy")) { score += 40; }
                    else { intentRequirementMet = false; }
                }
                if (isMusic) {
                    if (cat === "music" || cat === "concert" || title.includes("music") || title.includes("concert") || desc.includes("music")) score += 15;
                }
                if (isSport) {
                    if (cat === "sports" || cat === "sport" || title.includes("cricket") || title.includes("match")) score += 15;
                }
                if (isMovie) {
                    if (cat === "movies" || cat === "movie" || title.includes("movie") || title.includes("film")) score += 10;
                }

                // 3. Greedy Keyword Extraction & Scoring
                const ignoreWords = ["the", "and", "for", "with", "under", "below", "max", "cheap", "budget", "rs", "inr", "free", "show", "event", "events"];
                // We allow words of length 1 (like '5') to support sequels!
                const words = query.replace(/[^\w\s]/g, "").split(/\s+/).filter(w => w.length >= 1 && !ignoreWords.includes(w));

                let wordMatched = false;
                words.forEach(word => {
                    if (title.includes(word)) { score += 50; wordMatched = true; }
                    else if (desc.includes(word)) { score += 20; wordMatched = true; }
                    else if (cat.includes(word)) { score += 10; wordMatched = true; }
                });

                // If query is an exact substring of the title, give massive priority
                if (query.length > 2 && title.includes(query)) {
                    score += 150;
                    wordMatched = true;
                }

                // Fallback: If title contains ANY part of the query (e.g. "Shrek" matches "Shrek 5")
                // This is handled by the loop above, but we want a base score if anything matched
                if (wordMatched) score += 10;


                return { ...event, _matchScore: score };
            });

            // Filter out poorly matched events (score <= 0)
            let results = scoredEvents.filter(e => e._matchScore > 0);

            // Sort descending by highest score
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