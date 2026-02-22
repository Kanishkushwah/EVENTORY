import express from "express";
import { EventController } from "../controllers/event.controller.js";

const router = express.Router();

router.get("/", EventController.getEvents);
router.get("/smart-search", EventController.smartSearch);
router.get("/:id", EventController.getEventById);
router.post("/create", EventController.createEvent);
router.get("/auto-update", EventController.autoUpdateEvents);

export default router;