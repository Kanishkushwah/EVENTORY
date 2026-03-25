import express from "express";
import { supabase } from "../config/supabase.js";

const router = express.Router();

// ─── Fallback (only used if DB has NO row yet — first-ever launch) ────────────
const SEED_CONFIG = {
    hero: {
        title: "Spider-Man: Brand New Day",
        description: "Witness the spectacular return of the web-slinger in his most thrilling adventure yet. Book your tickets now!",
        image: "https://images.unsplash.com/photo-1635805737707-575885ab0820?q=80&w=2600&auto=format&fit=crop",
        trailerUrl: "https://youtu.be/BwntXFBNfOA"
    },
    releases: [
        { id: 1, title: "Spider-Man: Brand New Day", genre: "Action / Sci-Fi", releaseDate: "2026-07-31", image: "https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg" },
        { id: 2, title: "Avatar: Fire and Ash", genre: "Sci-Fi / Adventure", releaseDate: "2025-12-19", image: "https://image.tmdb.org/t/p/w500/yDHYTfA3R0jFYba16jBB1ef8oIt.jpg" },
        { id: 3, title: "Jolly LLB 3", genre: "Comedy / Drama", releaseDate: "2025-09-19", image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=500&auto=format&fit=crop" },
        { id: 4, title: "Border 2", genre: "Action / War", releaseDate: "2026-06-05", image: "https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45?q=80&w=500&auto=format&fit=crop" },
        { id: 5, title: "Toxic", genre: "Thriller / Action", releaseDate: "2026-04-10", image: "https://image.tmdb.org/t/p/w500/iiZZdoQBEYBv6id8su7ImL0oCbD.jpg" }
    ]
};

// ─── GET /api/config  ─ reads from Supabase, never from local file ─────────────
router.get("/", async (req, res) => {
    try {
        const { data, error } = await supabase
            .from("site_config")
            .select("config")
            .eq("id", 1)
            .single();

        if (error || !data) {
            // First time: no row exists yet — seed it and return seed
            console.log("ℹ️ No site_config row found, seeding defaults...");
            await supabase.from("site_config").upsert({ id: 1, config: SEED_CONFIG }, { onConflict: "id" });
            return res.json(SEED_CONFIG);
        }

        return res.json(data.config);
    } catch (err) {
        console.error("Config GET error:", err);
        return res.json(SEED_CONFIG); // Graceful fallback
    }
});

// ─── POST /api/config  ─ admin saves → written to Supabase only ───────────────
router.post("/", async (req, res) => {
    try {
        const newConfig = req.body;

        if (!newConfig || !newConfig.hero) {
            return res.status(400).json({ success: false, message: "Invalid config payload" });
        }

        const { error } = await supabase
            .from("site_config")
            .upsert({ id: 1, config: newConfig, updated_at: new Date().toISOString() }, { onConflict: "id" });

        if (error) {
            console.error("Config save error:", error);
            return res.status(500).json({ success: false, message: "Failed to save config to database." });
        }

        console.log("✅ Site config saved to Supabase by admin.");
        return res.json({ success: true, message: "Configuration saved permanently to database. Changes will never be lost!" });
    } catch (err) {
        console.error("Config POST error:", err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
});

export default router;
