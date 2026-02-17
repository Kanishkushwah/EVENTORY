import express from "express";
import { PaymentController } from "../controllers/payment.controller.js";

const router = express.Router();

// PAYMENT CONFIRMATION ENDPOINT
router.post("/confirm", PaymentController.confirmPayment);

export default router;