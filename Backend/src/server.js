import app from "./app.js";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 8000;

import { AutomationService } from "./services/automation.service.js";

app.listen(PORT, async () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);

    // Initialize Automated Event Sync
    try {
        // Run automation with a small delay to ensure DB connection is ready
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