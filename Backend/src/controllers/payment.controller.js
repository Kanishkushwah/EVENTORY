import { BookingService } from "../services/booking.service.js";
import { EmailService } from "../services/email.service.js";
import { PdfService } from "../services/pdf.service.js";
import { QRService } from "../services/qr.service.js";
import Stripe from "stripe";

// Use Stripe's official test secret key as a fallback so that Payment Elements can render locally without errors
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_4eC39HqLyjWDarjtT1zdp7dc');

export const PaymentController = {
    async confirmPayment(req, res) {
        try {
            const { reference, payment_method } = req.body;

            if (!reference || !payment_method) {
                return res.status(400).json({
                    message: "Missing booking reference or payment method",
                });
            }

            // 1) GET EXISTING BOOKING
            const booking = await BookingService.getBookingByReference(reference);

            if (!booking) {
                return res.status(404).json({
                    message: "Booking not found",
                });
            }

            // 2) UPDATE PAYMENT STATUS
            const updatedBooking = await BookingService.updatePaymentStatus(
                reference,
                payment_method
            );

            if (updatedBooking.error) {
                return res.status(400).json({
                    error: "Failed to update payment status",
                });
            }

            // 3–5) Generate QR, PDF and send email asynchronously
            try {
                const qrDataUrl = await QRService.generateQR(reference);
                const pdfBuffer = await PdfService.generateTicketPDF(
                    updatedBooking,
                    qrDataUrl
                );

                // Fire and forget email to avoid hanging the payment confirmation request
                EmailService.sendBookingEmail(
                    updatedBooking.user_email,
                    updatedBooking,
                    pdfBuffer
                ).catch((emailErr) => {
                    console.error("Background Email Error:", emailErr);
                });

            } catch (pdfOrQrError) {
                console.error("QR / PDF generation error:", pdfOrQrError);
                // continue; payment is already marked completed
            }

            return res.json({
                success: true,
                message: "Payment confirmed successfully",
                booking_reference: updatedBooking.reference,
            });
        } catch (error) {
            console.error("Payment Confirmation Error:", error);
            return res.status(500).json({
                message: "Internal server error",
                error: error.message,
            });
        }
    },

    async createPaymentIntent(req, res) {
        try {
            const { amount, reference } = req.body;

            if (!amount || !reference) {
                return res.status(400).json({ message: "Amount and reference are required" });
            }

            // Create a PaymentIntent with the order amount and currency
            const paymentIntent = await stripe.paymentIntents.create({
                amount: Math.round(amount * 100), // convert to paisa / cents
                currency: "inr",
                metadata: { booking_reference: reference }
            });

            res.send({
                clientSecret: paymentIntent.client_secret,
            });
        } catch (error) {
            console.error("Stripe Intent Error:", error);
            res.status(500).json({ message: "Failed to initialize payment", error: error.message });
        }
    },
};