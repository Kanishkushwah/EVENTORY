import axios from "axios";
import { EventModel } from "../models/event.model.js";

export const EventService = {
    /**
     * Fetch and store events from Ticketmaster API
     * Note: Requires TICKETMASTER_API_KEY environment variable
     */
    async fetchAndStoreEvents() {
        try {
            // Check if Ticketmaster API key is configured
            if (!process.env.TICKETMASTER_API_KEY || process.env.TICKETMASTER_API_KEY === 'ADD_LATER') {
                console.warn("⚠️  Ticketmaster API key not configured. Skipping event fetch.");
                return {
                    success: false,
                    message: "Ticketmaster API key not configured",
                    addedCount: 0,
                    skippedCount: 0
                };
            }

            const url = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${process.env.TICKETMASTER_API_KEY}&countryCode=IN&size=20`;

            const response = await axios.get(url);
            const events = response.data._embedded?.events || [];

            if (events.length === 0) {
                return {
                    success: true,
                    message: "No events found",
                    addedCount: 0,
                    skippedCount: 0
                };
            }

            let addedCount = 0;
            let skippedCount = 0;

            for (const ev of events) {
                // Validate required fields
                if (!ev.name) {
                    console.warn("Event missing name, skipping:", ev.id);
                    skippedCount++;
                    continue;
                }

                // Check if event already exists
                const eventTitle = ev.name;
                const eventDate = ev.dates?.start?.localDate || "";

                // Simple duplicate check by title and date
                const { data: existing } = await EventModel.getAll();
                const duplicate = existing?.find(e =>
                    e.title === eventTitle && e.date === eventDate
                );

                if (duplicate) {
                    skippedCount++;
                    continue;
                }

                // Create event record
                const eventData = {
                    title: ev.name,
                    date: ev.dates?.start?.localDate || "",
                    time: ev.dates?.start?.localTime || "TBD",
                    venue: ev._embedded?.venues?.[0]?.name || "TBD",
                    price: ev.priceRanges?.[0]?.min || 150,
                    category: ev.classifications?.[0]?.segment?.name || "Event",
                    image_url: ev.images?.[0]?.url || null,
                    description: ev.info || ev.pleaseNote || ""
                };

                await EventModel.create(eventData);
                addedCount++;
            }

            return {
                success: true,
                message: `Events updated: ${addedCount} added, ${skippedCount} skipped`,
                addedCount,
                skippedCount
            };

        } catch (error) {
            console.error("EventService Error:", error.message);

            // Handle specific API errors
            if (error.response) {
                const status = error.response.status;
                if (status === 401) {
                    throw new Error("Invalid Ticketmaster API key");
                } else if (status === 429) {
                    throw new Error("Ticketmaster API rate limit exceeded");
                }
            }

            throw new Error(`Failed to fetch events: ${error.message}`);
        }
    }
};