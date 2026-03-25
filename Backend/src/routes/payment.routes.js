import express from "express";
import { PaymentController } from "../controllers/payment.controller.js";

const router = express.Router();

// PAYMENT CONFIRMATION ENDPOINT
router.post("/confirm", PaymentController.confirmPayment);

// STRIPE PAYMENT INTENT ENDPOINT
router.post("/create-intent", PaymentController.createPaymentIntent);

// RAZORPAY ENDPOINTS
router.get("/razorpay/config", PaymentController.getRazorpayConfig);
router.post("/razorpay/order", PaymentController.createRazorpayOrder);
router.post("/razorpay/verify", PaymentController.verifyRazorpayPayment);

export default router;