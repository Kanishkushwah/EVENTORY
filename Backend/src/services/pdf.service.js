import PDFDocument from "pdfkit";
import axios from "axios";

export const PdfService = {
    async generateTicketPDF(booking, qrDataUrl) {
        return new Promise(async (resolve, reject) => {
            try {
                const doc = new PDFDocument({
                    size: 'A4',
                    margin: 0
                });

                const buffers = [];
                doc.on('data', buffers.push.bind(buffers));
                doc.on('end', () => {
                    const pdfBuffer = Buffer.concat(buffers);
                    resolve(pdfBuffer);
                });

                // Dimensions
                const pageWidth = 612;
                const cardWidth = 500;
                const cardHeight = 450; // Dynamic based on content mainly
                const cardX = (pageWidth - cardWidth) / 2;
                const cardY = 60;

                // --- 1. Draw Card Shadow & Background ---
                // Shadow
                doc.roundedRect(cardX + 4, cardY + 4, cardWidth, cardHeight, 16)
                    .fill('#E5E7EB');

                // Main Card Body (White)
                doc.roundedRect(cardX, cardY, cardWidth, cardHeight, 16)
                    .fill('#FFFFFF');

                // --- 2. Header Section (Purple/Image) ---
                const headerHeight = 180;

                doc.save();
                // Create clipping path for top-rounded corners
                doc.moveTo(cardX, cardY + headerHeight)
                    .lineTo(cardX, cardY + 16)
                    .quadraticCurveTo(cardX, cardY, cardX + 16, cardY)
                    .lineTo(cardX + cardWidth - 16, cardY)
                    .quadraticCurveTo(cardX + cardWidth, cardY, cardX + cardWidth, cardY + 16)
                    .lineTo(cardX + cardWidth, cardY + headerHeight)
                    .closePath();
                doc.clip();

                // Draw Poster Image (or Fallback)
                let imageDrawn = false;
                if (booking.poster_url) {
                    try {
                        const imgRes = await axios.get(booking.poster_url, { responseType: 'arraybuffer', timeout: 3000 });
                        const img = Buffer.from(imgRes.data);
                        doc.image(img, cardX, cardY, { fit: [cardWidth, headerHeight + 50], align: 'center' }); // slightly taller to verify cover
                        imageDrawn = true;
                    } catch (e) { console.log("Poster load failed"); }
                }

                // Purple Overlay (Gradient-ish)
                doc.rect(cardX, cardY, cardWidth, headerHeight)
                    .fillOpacity(0.85)
                    .fill('#7C3AED'); // Brand Purple

                doc.fillOpacity(1); // Reset opacity

                // Header Content
                // Badge
                doc.roundedRect(cardX + 30, cardY + 30, 120, 24, 12)
                    .fill('#A78BFA'); // Lighter purple pill
                doc.fontSize(10)
                    .fillColor('#FFFFFF')
                    .font('Helvetica-Bold')
                    .text("SPECIAL SCREENING", cardX + 30, cardY + 36, { width: 120, align: 'center' });

                // Title
                doc.fontSize(22)
                    .font('Helvetica-Bold')
                    .fillColor('#FFFFFF')
                    .text(booking.event_title || "Event Title", cardX + 30, cardY + 90, { width: cardWidth - 60 });

                doc.restore(); // End Clipping

                // --- 3. Ticket Details Body ---
                const bodyY = cardY + headerHeight + 30;
                const col1X = cardX + 30;
                const col2X = cardX + 220; // Middle column

                // We split into Left Section (Details) and Right Section (QR)
                // Left Section is approx 60% width

                const labelColor = '#9CA3AF'; // Gray-400
                const valueColor = '#1F2937'; // Gray-900

                // ROW 1: Date & Time
                // Date
                doc.fontSize(8).font('Helvetica-Bold').fillColor(labelColor).text("DATE", col1X, bodyY);
                doc.fontSize(12).font('Helvetica-Bold').fillColor(valueColor).text(booking.event_date || "TBA", col1X, bodyY + 15);

                // Time
                doc.fontSize(8).font('Helvetica-Bold').fillColor(labelColor).text("TIME", col2X, bodyY);
                doc.fontSize(12).font('Helvetica-Bold').fillColor(valueColor).text(booking.event_time || "TBA", col2X, bodyY + 15);

                const row2Y = bodyY + 50;

                // ROW 2: Venue & Seat
                // Venue
                doc.fontSize(8).font('Helvetica-Bold').fillColor(labelColor).text("VENUE", col1X, row2Y);
                doc.fontSize(12).font('Helvetica-Bold').fillColor(valueColor).text(booking.venue || "TBA", col1X, row2Y + 15, { width: 180 });

                // Seat
                const seats = Array.isArray(booking.seats) ? booking.seats.join(", ") : (booking.seats || "GA");
                doc.fontSize(8).font('Helvetica-Bold').fillColor(labelColor).text("SEAT", col2X, row2Y);
                doc.fontSize(12).font('Helvetica-Bold').fillColor('#7C3AED').text(seats, col2X, row2Y + 15);

                const row3Y = row2Y + 50;

                // ROW 3: Order ID & Total
                // Order ID
                doc.fontSize(8).font('Helvetica-Bold').fillColor(labelColor).text("ORDER ID", col1X, row3Y);
                doc.fontSize(10).font('Helvetica-Bold').fillColor(valueColor).text(booking.reference, col1X, row3Y + 15);

                // Total
                doc.fontSize(8).font('Helvetica-Bold').fillColor(labelColor).text("TOTAL PAID", col2X, row3Y);
                doc.fontSize(14).font('Helvetica-Bold').fillColor('#7C3AED').text("Rs. " + booking.amount_paid, col2X, row3Y + 12);


                // --- 4. QR Code Section (Right Side) ---
                const qrBoxSize = 160;
                const qrBoxX = cardX + cardWidth - qrBoxSize - 30;
                const qrBoxY = bodyY; // Align with top of details

                // QR Background Box (Light Pink/Purple bg)
                doc.roundedRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize + 30, 12)
                    .fill('#FDF2F8'); // Pink-50ish

                // QR Code Image
                if (qrDataUrl) {
                    try {
                        const qrBase64 = qrDataUrl.replace(/^data:image\/png;base64,/, "");
                        const qrImg = Buffer.from(qrBase64, "base64");
                        // White bg for QR
                        doc.roundedRect(qrBoxX + 20, qrBoxY + 20, 120, 120, 8).fill('#FFFFFF');
                        doc.image(qrImg, qrBoxX + 25, qrBoxY + 25, { width: 110, height: 110 });
                    } catch (e) {
                        console.error("QR Error", e);
                    }
                }

                // Scan Text
                doc.fontSize(9).font('Helvetica-Bold').fillColor(valueColor)
                    .text("SCAN AT ENTRY", qrBoxX, qrBoxY + 150, { width: qrBoxSize, align: 'center' });

                doc.fontSize(7).font('Helvetica').fillColor(labelColor)
                    .text("Valid for 1 person", qrBoxX, qrBoxY + 162, { width: qrBoxSize, align: 'center' });


                // --- 5. Footer (Simple) ---
                const footerY = cardY + cardHeight + 20;
                doc.fontSize(8).font('Helvetica').fillColor('#9CA3AF')
                    .text("Thank you for using Eventory. Please show this ticket at the entrance.", 0, footerY, { width: pageWidth, align: 'center' });

                doc.end();

            } catch (error) {
                console.error("PDF Generation Error:", error);
                reject(error);
            }
        });
    }
};