import { PdfService } from "../services/pdf.service.js";
import { QRService } from "../services/qr.service.js";
import { BookingService } from "../services/booking.service.js";

export const PdfController = {
    async generateTicket(req, res) {
        try {
            const reference = req.params.reference;
            
            // Get booking
            const booking = await BookingService.getBookingByReference(reference);

            if (!booking) {
                return res.status(404).json({ 
                    message: "Booking not found" 
                });
            }

            // Generate QR
            const qrDataUrl = await QRService.generateQR(reference);

            // Generate PDF
            const pdfBuffer = await PdfService.generateTicketPDF(
                booking, 
                qrDataUrl
            );

            // Send PDF
            res.setHeader("Content-Type", "application/pdf");
            res.setHeader(
                "Content-Disposition", 
                `attachment; filename=Eventory-Ticket-${reference}.pdf`
            );

            res.send(pdfBuffer);

        } catch (err) {
            console.error("PDF Generation Error:", err);
            res.status(500).json({ 
                message: "Failed to generate ticket PDF",
                error: err.message
            });
        }
    }
};