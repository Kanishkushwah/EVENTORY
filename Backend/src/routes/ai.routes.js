import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabase } from "../config/supabase.js";

const router = express.Router();

// Helper to fetch site knowledge dynamically
const getSiteKnowledge = async () => {
    try {
        const { data: config } = await supabase.from("site_config").select("config").eq("id", 1).single();
        const { data: events } = await supabase.from("events").select("title, category, venue, price, date").limit(10);

        let knowledge = `--- SITE KNOWLEDGE BASE (REAL-TIME) ---\n`;
        if (config) {
            knowledge += `Featured Event: ${config.config.hero.title}\nDescription: ${config.config.hero.description}\n`;
            knowledge += `Upcoming Releases: ${config.config.releases.map(r => `${r.title} (${r.genre}) on ${r.releaseDate}`).join(", ")}\n`;
        }
        if (events) {
            knowledge += `Currently Booking: ${events.map(e => `${e.title} at ${e.venue} for ₹${e.price}`).join(" | ")}\n`;
        }
        knowledge += `Promo Codes: 'WELCOME50' (50% off for new users), 'EVENTORY20' (20% off high-value bookings), 'MOVIE60' (Flat discount on movies).\n`;
        knowledge += `Support: Phone +91 8511812332, Email eventorytickets@gmail.com\n`;
        return knowledge;
    } catch (err) {
        return "Knowledge base temporarily unavailable. Help the user with general booking info.";
    }
};

// Helper to get Gemini Model (Lazy-loaded to handle env changes)
const getModel = async () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "YOUR_GEMINI_API_KEY_HERE") {
        throw new Error("GEMINI_API_KEY_MISSING");
    }

    const siteKnowledge = await getSiteKnowledge();
    const genAI = new GoogleGenerativeAI(apiKey);

    return genAI.getGenerativeModel({
        model: "gemini-2.0-flash", // Using latest stable model name
        systemInstruction: `
            You are "Eve", the official AI Support Agent for Eventory (2026 Edition). 
            Goal: Help users with bookings, technical issues, and platform navigation.
            
            ${siteKnowledge}
            
            Core Behavior:
            - Professional, empathetic, and slightly witty. Use emojis (🎬, 🍿, 🎫, ✨).
            - When asked about events/movies, use the REAL-TIME knowledge provided above.
            - For payment issues, always ask for their "Booking Reference ID" (e.g., EVT-xxxx).
            - If you can't solve it, guide them to call +91 8511812332.
            - Keep responses snappy and suitable for a mobile chat interface.
        `
    });
};

// POST /api/ai/chat
router.post("/chat", async (req, res) => {
    const { message, history } = req.body;

    if (!message) {
        return res.status(400).json({ success: false, message: "No message provided." });
    }

    try {
        const model = await getModel();

        const chat = model.startChat({
            history: history || [],
            generationConfig: { maxOutputTokens: 500, temperature: 0.7 },
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;
        const text = response.text();

        res.json({ success: true, response: text });
    } catch (error) {
        console.error("❌ Gemini Support Error:", error.message);

        let userMessage = "Eve is taking a quick popcorn break 🍿. Please try again in a moment or contact our human support team!";

        if (error.message === "GEMINI_API_KEY_MISSING") {
            userMessage = "AI Chat is being initialized. Please use phone/email in the meantime.";
        } else if (error.message.includes("429") || error.message.includes("quota")) {
            userMessage = "I'm receiving too many requests! Please wait a minute or email us.";
        }

        res.status(500).json({
            success: false,
            message: userMessage,
            errorType: error.message
        });
    }
});

export default router;
