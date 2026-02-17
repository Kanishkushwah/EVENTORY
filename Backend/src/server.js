import app from "./app.js";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 8000;

import { AutomationService } from "./services/automation.service.js";

app.listen(PORT, async () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);

    // Initialize Automated Event Sync
    try {
        // await AutomationService.syncUpcomingMovies();
        // await AutomationService.syncWorldCupEvents();
        console.log("✅ Automation Service Disabled (Debugging)");
    } catch (err) {
        console.error("⚠️ Automation Service Failed:", err);
    }
});