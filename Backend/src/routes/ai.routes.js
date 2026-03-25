import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

const router = express.Router();

// ─── Gemini AI Setup ─────────────────────────────────────────────────────────
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: `
        You are "Eve", the official AI Support Agent for Eventory. 
        Your goal is to help users with their booking problems, technical issues, and general inquiries.
        
        Key Info:
        - Customer Support Email: eventorytickets@gmail.com
        - Customer Support Phone: +91 8511812332
        - Website: Eventory (Cinematic Event Booking Platform)
        
        Behavior Guidelines:
        1. Be extremely polite, professional, and empathetic.
        2. Use emojis occasionally to stay friendly (🎬, 🎫, 🍿).
        3. If a user has a payment problem, ask them for their Booking Reference ID (starts with BKG or EVT).
        4. If you cannot solve a problem, provide the email and phone number above.
        5. Keep responses concise and helpful. Don't mention you are an AI unless asked.
        6. You can answer questions about movie releases, how to book, and how to use promo codes.
        
        If they ask for a promo code, remind them they can use 'EVENTORY20' for 20% off or '95OFF' for huge savings.
    `
});

// POST /api/ai/chat
router.post("/chat", async (req, res) => {
    const { message, history } = req.body;

    if (!message) {
        return res.status(400).json({ success: false, message: "Message is required" });
    }

    try {
        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({
                success: false,
                message: "Gemini API key is not configured on the server."
            });
        }

        const chat = model.startChat({
            history: history || [],
            generationConfig: {
                maxOutputTokens: 500,
            },
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;
        const text = response.text();

        res.json({ success: true, response: text });
    } catch (error) {
        console.error("Gemini AI Error:", error);
        res.status(500).json({
            success: false,
            message: "Eve is currently overcapacity. Please try again or contact support directly."
        });
    }
});

export default router;
