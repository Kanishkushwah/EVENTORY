import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const configFile = path.join(__dirname, "../data/config.json");

// Define a default config in case the file doesn't exist
const defaultConfig = {
    hero: {
        title: "Spider-Man: Brand New Day",
        description: "Witness the spectacular return of the web-slinger in his most thrilling adventure yet. Book your tickets now!",
        image: "https://images.unsplash.com/photo-1635805737707-575885ab0820?q=80&w=2600&auto=format&fit=crop",
        trailerUrl: "https://youtu.be/BwntXFBNfOA"
    },
    releases: [
        {
            id: Date.now() + 1,
            title: "Spider-Man: Brand New Day",
            genre: "Action / Sci-Fi",
            image: "https://images.unsplash.com/photo-1635805737707-575885ab0820?q=80&w=1000&auto=format&fit=crop"
        },
        {
            id: Date.now() + 2,
            title: "Avatar: Fire and Ash",
            genre: "Sci-Fi / Adventure",
            image: "https://m.media-amazon.com/images/M/MV5BZWUwZDFjMDMtZWU2Yy00ZGZhLWI2MGEtODYxOTcxMWRiNTViXkEyXkFqcGc@._V1_.jpg"
        },
        {
            id: Date.now() + 3,
            title: "Jolly LLB 3",
            genre: "Comedy / Drama",
            image: "https://m.media-amazon.com/images/M/MV5BMjA5OTEyMjUtMTE5MC00MzhhLTk2MmUtNmM3YjBlNjRjMTkzXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg"
        }
    ]
};

// Guarantee data folder exists
if (!fs.existsSync(path.join(__dirname, "../data"))) {
    fs.mkdirSync(path.join(__dirname, "../data"));
}

router.get("/", (req, res) => {
    try {
        if (!fs.existsSync(configFile)) {
            return res.json(defaultConfig);
        }
        const data = fs.readFileSync(configFile, "utf-8");
        res.json(JSON.parse(data));
    } catch (error) {
        console.error("Error reading config", error);
        res.json(defaultConfig); // Fallback
    }
});

router.post("/", (req, res) => {
    try {
        fs.writeFileSync(configFile, JSON.stringify(req.body, null, 2), "utf-8");
        res.json({ success: true, message: "Configuration saved successfully" });
    } catch (error) {
        console.error("Error saving config", error);
        res.status(500).json({ success: false, message: "Server error overriding config setup." });
    }
});

export default router;
