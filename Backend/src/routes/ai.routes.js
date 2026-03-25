import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

const router = express.Router();

// Helper to get Gemini Model (Lazy-loaded to handle env changes)
const getModel = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "YOUR_GEMINI_API_KEY_HERE") {
        throw new Error("GEMINI_API_KEY_MISSING");
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    return genAI.getGenerativeModel({
        model: "gemini-2.5-flash", // Verified working version with active quota for this API key
        systemInstruction: `
            You are "Eve", the official AI Support Agent for Eventory. 
            Goal: Help users with bookings, technical issues, and info.
            
            Key Info:
            - Email: eventorytickets@gmail.com
            - Phone: +91 8511812332
            
            Instructions:
            - Polite, empathetic, use emojis (🎬, 🎫).
            - Ask for Reference ID (EVT-xxx) for payment issues.
            - If you can't solve it, point to the email/phone.
            - Keep it snappy.
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
        const model = getModel();

        const chat = model.startChat({
            history: history || [],
            generationConfig: { maxOutputTokens: 500 },
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;
        const text = response.text();

        res.json({ success: true, response: text });
    } catch (error) {
        console.error("❌ Gemini Support Error:", error.message);

        let userMessage = "Eve is taking a quick popcorn break 🍿. Please try again in a moment or contact our human support team!";

        if (error.message === "GEMINI_API_KEY_MISSING") {
            userMessage = "AI Chat is currently being initialized. Please contact support via email/phone in the meantime.";
            console.error("Critical: GEMINI_API_KEY is missing in .env");
        } else if (error.message.includes("429") || error.message.includes("quota")) {
            userMessage = "I'm receiving too many requests right now! Please wait a minute or email us at eventorytickets@gmail.com.";
        } else if (error.message.includes("API key not valid")) {
            userMessage = "Support Chat configuration error. Please use our phone/email options for immediate help.";
            console.error("Critical: GEMINI_API_KEY is invalid.");
        }

        res.status(500).json({
            success: false,
            message: userMessage,
            errorType: error.message
        });
    }
});

export default router;
