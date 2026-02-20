import { BookingService } from "../services/booking.service.js";
import { EmailService } from "../services/email.service.js";
import { PdfService } from "../services/pdf.service.js";
import { QRService } from "../services/qr.service.js";

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
};