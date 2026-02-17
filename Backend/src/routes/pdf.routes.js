import express from "express";
import { PdfController } from "../controllers/pdf.controller.js";

const router = express.Router();

// GET /api/pdf/ticket/:reference
router.get("/ticket/:reference", PdfController.generateTicket);

export default router;