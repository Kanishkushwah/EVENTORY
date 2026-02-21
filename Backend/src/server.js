import app from "./app.js";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import { AutomationService } from "./services/automation.service.js";

dotenv.config();

const PORT = process.env.PORT || 8000;

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: [
            'http://127.0.0.1:5500',
            'http://localhost:5500',
            'http://127.0.0.1:5501',
            'http://localhost:5501',
            'http://localhost:5173',
            'http://localhost:3000',
            'https://eventory-cyzy.onrender.com'
        ],
        methods: ["GET", "POST"]
    }
});

// Live Seat Locking Logic
io.on("connection", (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // Join a specific showtime room to only broadcast/listen within that showtime
    socket.on("joinShowtime", (showtimeId) => {
        socket.join(`showtime_${showtimeId}`);
        console.log(`Client ${socket.id} joined showtime_${showtimeId}`);
    });

    // Handle seat locking
    socket.on("lockSeat", ({ showtimeId, seatId }) => {
        console.log(`🔒 Seat ${seatId} locked by ${socket.id} for showtime_${showtimeId}`);
        // Broadcast to everyone ELSE in that room that this seat is locked
        socket.to(`showtime_${showtimeId}`).emit("seatLocked", { seatId, by: socket.id });
    });

    // Handle seat unlocking
    socket.on("unlockSeat", ({ showtimeId, seatId }) => {
        console.log(`🔓 Seat ${seatId} unlocked by ${socket.id} for showtime_${showtimeId}`);
        // Broadcast to everyone ELSE in that room
        socket.to(`showtime_${showtimeId}`).emit("seatUnlocked", { seatId });
    });

    socket.on("disconnect", () => {
        console.log(`🔌 Client disconnected: ${socket.id}`);
        // Potentially handle unlocking seats that were locked by this disconnected user
        // Usually involves keeping a map of socket.id -> [{showtimeId, seatId}]
    });
});

httpServer.listen(PORT, async () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);

    // Initialize Automated Event Sync
    try {
        setTimeout(async () => {
            try {
                console.log("🎬 Starting Automation Service...");
                await AutomationService.syncUpcomingMovies();
                await AutomationService.syncWorldCupEvents();
                console.log("✅ Automation Service Completed");
            } catch (innerErr) {
                console.error("⚠️ Automation Service Error (Non-fatal):", innerErr);
            }
        }, 5000);
    } catch (err) {
        console.error("⚠️ Automation Service Failed:", err);
    }
});