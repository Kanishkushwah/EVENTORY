import express from "express";
import cors from "cors";
import session from "express-session";
import passport from "./config/passport.js";
import bookingRoutes from "./routes/booking.routes.js";
import movieRoutes from "./routes/movie.routes.js";
import eventRoutes from "./routes/event.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import pdfRoutes from "./routes/pdf.routes.js";
import userRoutes from "./routes/user.routes.js";
import authRoutes from "./routes/auth.routes.js";
import cinemaRoutes from "./routes/cinema.routes.js";
import showtimeRoutes from "./routes/showtime.routes.js";
import cancellationRoutes from "./routes/cancellation.routes.js";
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middlewares
app.use(cors({
    origin: [
        'http://127.0.0.1:5500',
        'http://localhost:5500',
        'http://127.0.0.1:5501',
        'http://localhost:5501',
        'http://localhost:5173',
        'http://localhost:3000',
        'https://eventory-cyzy.onrender.com' // Allow deployed frontend
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// SERVE FRONTEND (Critical Fix)
// 1. Try serving from 'public' (For Deployment)
const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));
app.use('/EVENTHUB', express.static(publicPath));

// 2. Fallback to Dev Path (For Local Dev)
const devPath = path.join(__dirname, '../../EVENTHUB');
app.use(express.static(devPath));
app.use('/EVENTHUB', express.static(devPath));
app.use(express.json());

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'eventory-secret-key-change-this-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production'
    }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Health check
app.get("/", (req, res) => {
    res.json({
        status: "OK",
        message: "Eventory Backend Running Successfully 🎉",
        timestamp: new Date().toISOString()
    });
});

// API Routes
app.use("/auth", authRoutes);      // For Google OAuth
app.use("/api/auth", authRoutes);  // For Register/Login endpoints
app.use("/api/bookings", bookingRoutes);
app.use("/api/movies", movieRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/pdf", pdfRoutes);
app.use("/api/users", userRoutes);
app.use("/api/cinemas", cinemaRoutes);
app.use("/api/showtimes", showtimeRoutes);
app.use("/api/bookings", cancellationRoutes);

// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        message: "Route not found",
        path: req.path
    });
});

// Error Handler
app.use((err, req, res, next) => {
    console.error("Server Error:", err);
    res.status(500).json({
        message: "Internal server error",
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Server is running 🚀' });
});

export default app;