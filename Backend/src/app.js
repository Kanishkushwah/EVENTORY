import 'dotenv/config';
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
import configRoutes from "./routes/config.routes.js";
import notifyRoutes from "./routes/notify.routes.js";
import waitlistRoutes from "./routes/waitlist.routes.js";
import aiRoutes from "./routes/ai.routes.js";
import promoRoutes from "./routes/promo.routes.js";
import path from 'path';
import { fileURLToPath } from 'url';
import { ReminderService } from './services/reminder.service.js';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import { errorHandler } from './middleware/error.middleware.js';

const app = express();

// Initialize CRON jobs
ReminderService.init();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(helmet({
    contentSecurityPolicy: false, // Too restrictive for external CDNs by default without careful config
    crossOriginEmbedderPolicy: false
}));
app.use(compression()); // Gzip compression
app.use(morgan('combined')); // Better logging
app.use(cookieParser()); // Parse strictly-for-HTTP cookies

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: { error: 'Too many requests from this IP, please try again later.' }
});
app.use(limiter);

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

// SERVE FRONTEND - PRODUCTION QUALITY
const staticOptions = {
    etag: true,
    setHeaders: (res, path) => {
        if (path.endsWith('.html')) {
            // Never cache HTML so users always see the latest UI updates
            res.setHeader('Cache-Control', 'no-cache');
        } else {
            // Cache assets (JS, CSS, images) for better performance
            res.setHeader('Cache-Control', 'public, max-age=86400');
        }
    }
};

// 1. Try serving from 'public' (For Deployment)
const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath, staticOptions));
app.use('/EVENTHUB', express.static(publicPath, staticOptions));

// 2. Fallback to Dev Path (For Local Dev)
const devPath = path.join(__dirname, '../../EVENTHUB');
app.use(express.static(devPath, staticOptions));
app.use('/EVENTHUB', express.static(devPath, staticOptions));
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

// Health check (Fast endpoint for UptimeRobot)
app.get(["/", "/api/health"], (req, res) => {
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
app.use("/api/config", configRoutes);
app.use("/api/notify", notifyRoutes);
app.use("/api/waitlist", waitlistRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/promo", promoRoutes);

// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        message: "Route not found",
        path: req.path
    });
});

// Centralized Error Handler Middleware
app.use(errorHandler);

app.get('/api/test-email', async (req, res) => {
    try {
        const { EmailService } = await import('./services/email.service.js');
        const booking = {
            reference: 'TEST-123', event_title: 'Test', event_date: 'Today', event_time: 'Now',
            venue: 'Here', seats: ['A1'], amount_paid: 0
        };
        const pdf = Buffer.from('test');
        await EmailService.sendBookingEmail(process.env.ADMIN_EMAIL || 'test@test.com', booking, pdf);
        res.json({ success: true, envEmail: !!process.env.SMTP_EMAIL, envPass: !!process.env.SMTP_APP_PASSWORD });
    } catch (e) {
        res.status(500).json({ error: String(e), stack: e.stack, envEmail: !!process.env.SMTP_EMAIL, envPass: !!process.env.SMTP_APP_PASSWORD });
    }
});

app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Server is running 🚀' });
});

export default app;