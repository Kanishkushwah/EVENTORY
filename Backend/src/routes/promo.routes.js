// Promo Routes for Eventory 🎬
import express from "express";
import { PromoController } from "../controllers/promo.controller.js";

const router = express.Router();

// POST /api/promo/validate — Validate a promo code
router.post("/validate", PromoController.validatePromo);

export default router;
