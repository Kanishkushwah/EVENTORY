import express from "express";
import { PaymentController } from "../controllers/payment.controller.js";

const router = express.Router();

// PAYMENT CONFIRMATION ENDPOINT
router.post("/confirm", PaymentController.confirmPayment);

// STRIPE PAYMENT INTENT ENDPOINT
router.post("/create-intent", PaymentController.createPaymentIntent);

export default router;