import { BookingService } from "../services/booking.service.js";
import { EmailService } from "../services/email.service.js";
import { PdfService } from "../services/pdf.service.js";
import { QRService } from "../services/qr.service.js";
import Stripe from "stripe";
import Razorpay from "razorpay";
import crypto from "crypto";

// Use your own Stripe secret key. If it fails, the simulated UI will render securely.
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_YOUR_STRIPE_SECRET_KEY');

// Razorpay Instance
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_YOUR_KEY_ID',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'YOUR_KEY_SECRET'
});

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
            // Standardize on 'completed' for newly confirmed payments
            const updatedBooking = await BookingService.updatePaymentStatus(
                reference,
                payment_method
            );

            if (updatedBooking.error) {
                return res.status(400).json({ error: "Failed to update payment status" });
            }

            // 3–5) Perform High-Latency Tasks ASYNCHRONOUSLY
            // 3–5) Perform High-Latency Tasks
            // Fast Receipt - No attachments, sends in <1 sec
            console.log(`📧 Sending instant receipt to ${updatedBooking.user_email}...`);
            await EmailService.sendInstantReceipt(updatedBooking.user_email, updatedBooking);

            // Detailed Ticket - Tasks that are slower (QR generation + PDF rendering + Nodemailer attachment overhead)
            (async () => {
                console.log(`⏱️ Starting background ticket tasks for ${reference}...`);
                try {
                    const qrDataUrl = await QRService.generateQR(reference);
                    console.log(`✅ QR generated for ${reference}`);

                    const pdfBuffer = await PdfService.generateTicketPDF(updatedBooking, qrDataUrl);
                    console.log(`✅ PDF generated for ${reference} (Size: ${pdfBuffer.length} bytes)`);

                    const emailResult = await EmailService.sendBookingEmail(
                        updatedBooking.user_email,
                        updatedBooking,
                        pdfBuffer
                    );

                    if (emailResult.success) {
                        console.log(`📧 Ticket email sent successfully to ${updatedBooking.user_email}`);
                    } else {
                        console.error(`❌ Ticket email failed:`, emailResult);
                    }
                } catch (pdfOrQrError) {
                    console.error("🔥 Detailed Ticket (BG task) error:", pdfOrQrError);
                }
            })();

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
            if (!amount || !reference) return res.status(400).json({ message: "Amount and reference are required" });

            const paymentIntent = await stripe.paymentIntents.create({
                amount: Math.round(amount * 100),
                currency: "inr",
                metadata: { booking_reference: reference }
            });
            res.send({ clientSecret: paymentIntent.client_secret });
        } catch (error) {
            res.status(500).json({ message: "Failed to initialize payment", error: error.message });
        }
    },

    // RAZORPAY: Get Public Config
    async getRazorpayConfig(req, res) {
        res.json({ keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_YOUR_KEY_ID' });
    },

    // RAZORPAY: Create Order
    async createRazorpayOrder(req, res) {
        try {
            const { amount, reference } = req.body;
            if (!amount || !reference) {
                return res.status(400).json({ message: "Amount and reference are required" });
            }

            const options = {
                amount: Math.round(amount * 100), // convert to paisa
                currency: "INR",
                receipt: `rcpt_${reference}`,
                notes: { booking_reference: reference }
            };

            const order = await razorpay.orders.create(options);
            res.json({ success: true, order });
        } catch (error) {
            console.error("Razorpay Order Error:", error);
            res.status(500).json({ message: "Razorpay initialization failed", error: error.message });
        }
    },

    // RAZORPAY: Verify Signature
    async verifyRazorpayPayment(req, res) {
        try {
            const { razorpay_order_id, razorpay_payment_id, razorpay_signature, reference } = req.body;

            // Log for sanity
            console.log(`🔐 Verifying Razorpay Payment for ${reference}`);

            const secret = process.env.RAZORPAY_KEY_SECRET || 'YOUR_KEY_SECRET';
            const hmac = crypto.createHmac("sha256", secret);
            hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
            const generatedSignature = hmac.digest("hex");

            if (generatedSignature === razorpay_signature) {
                console.log(`✅ Razorpay Signature valid! Confirming booking: ${reference}`);

                // Update the request body to ensure confirmPayment sees the correct method
                req.body.payment_method = "razorpay";

                // Directly call confirmPayment logic
                return PaymentController.confirmPayment(req, res);
            } else {
                console.error(`❌ Razorpay Signature mismatch for booking: ${reference}`);
                console.error(`   - Expected: ${generatedSignature}`);
                console.error(`   - Received: ${razorpay_signature}`);

                // Provide a more helpful error for the developer if keys are missing
                const isPlaceholder = secret === 'YOUR_KEY_SECRET';
                return res.status(400).json({
                    success: false,
                    message: isPlaceholder ? "RAZORPAY_KEY_SECRET is missing in server environment" : "Invalid payment signature"
                });
            }
        } catch (error) {
            console.error("Verification Error:", error);
            res.status(500).json({ success: false, message: "Verification failed" });
        }
    }
};