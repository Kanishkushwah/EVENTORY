import express from 'express';
import passport from '../config/passport.js';

const router = express.Router();

// Google OAuth Login
router.get('/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Google OAuth Callback - SIMPLEST SOLUTION: Direct redirect to dashboard
// Google OAuth Callback - DYNAMIC REDIRECT FIX
router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/EVENTHUB/login.html?error=auth_failed' }),
    (req, res) => {
        // Construct dynamic base URL to work on Localhost, Mobile (LAN), and Production (Render)
        const protocol = req.headers['x-forwarded-proto'] || req.protocol;
        const host = req.get('host');
        const baseUrl = `${protocol}://${host}`;
        
        // Redirect to Backend-Served Frontend
        const dashboardUrl = new URL(`${baseUrl}/EVENTHUB/user-profile.html`);
        dashboardUrl.searchParams.set('googleauth', '1');
        dashboardUrl.searchParams.set('id', req.user.id);
        dashboardUrl.searchParams.set('email', req.user.email);
        dashboardUrl.searchParams.set('name', req.user.name);
        dashboardUrl.searchParams.set('pic', req.user.profile_picture || '');

        res.redirect(dashboardUrl.toString());
    }
);

// Logout
router.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) return res.status(500).json({ message: 'Logout failed' });
        res.json({ message: 'Logged out successfully' });
    });
});

// Get current user
router.get('/user', (req, res) => {
    if (req.isAuthenticated()) {
        return res.json({
            loggedIn: true,
            user: { id: req.user.id, email: req.user.email, name: req.user.name, profilePicture: req.user.profile_picture }
        });
    }
    res.json({ loggedIn: false });
});

// Manual Registration
import { UserService } from '../services/user.service.js';

router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const result = await UserService.registerUser({ name, email, password });

        if (result.error) {
            return res.status(400).json({ message: result.error.message || "Registration failed" });
        }

        // Log the user in immediately
        req.login(result, (err) => {
            if (err) {
                console.error("Login Error after Register:", err);
                return res.status(500).json({ message: "Login failed" });
            }
            return res.json({ success: true, message: "Registered successfully", user: result });
        });

    } catch (err) {
        console.error("Register Route Error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// Manual Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. CHECK ADMIN LOGIN
        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            return res.json({
                success: true,
                message: "Welcome back, Admin!",
                user: { name: 'Administrator', email: email, role: 'admin' },
                redirect: 'admin-dashboard.html'
            });
        }

        // 2. CHECK REGULAR USER
        const result = await UserService.verifyUser(email, password);

        if (result.error) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        req.login(result, (err) => {
            if (err) {
                console.error("Login Error:", err);
                return res.status(500).json({ message: "Login failed" });
            }
            return res.json({
                success: true,
                message: "Logged in successfully",
                user: result,
                redirect: 'user-profile.html' // Standard user redirect
            });
        });

    } catch (err) {
        console.error("Login Route Error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

export default router;
