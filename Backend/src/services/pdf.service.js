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

                const pageWidth = 612;
                const pageHeight = 842;

                // ===== THEME LOGIC =====
                const isSports = (booking.category || '').toLowerCase() === 'sports' || (booking.event_title || '').includes('World Cup');
                const themeColor = isSports ? '#1E40AF' : '#7C3AED'; // Blue for Sports, Purple for others
                const accentColor = isSports ? '#FBBF24' : '#C4B5FD'; // Gold for Sports, Light Purple for others
                const logoText = isSports ? 'ICC WORLD CUP 2026' : 'Eventory';

                // ===== HEADER =====
                // Header Background
                doc.rect(0, 0, pageWidth, 80)
                    .fill(themeColor);

                // Texture overlay (dots) - Simulated with small circles if possible, or just solid color
                // Logo/Title
                doc.fillColor('#FFFFFF')
                    .fontSize(isSports ? 22 : 20)
                    .font('Helvetica-Bold')
                    .text(logoText, 40, 30);

                if (isSports) {
                    doc.fontSize(10)
                        .fillColor(accentColor)
                        .text('OFFICIAL TICKET', 40, 55);
                }

                // Booking Reference Box
                doc.roundedRect(pageWidth - 190, 20, 150, 40, 5)
                    .fill('#FFFFFF');

                doc.fontSize(8)
                    .fillColor('#6B7280')
                    .font('Helvetica-Bold')
                    .text('BOOKING REF', pageWidth - 180, 28);

                doc.fontSize(12)
                    .fillColor('#1F2937')
                    .font('Helvetica-Bold')
                    .text(booking.reference, pageWidth - 180, 42);

                // ===== MAIN TICKET CARD =====
                const cardX = 30;
                const cardY = 100;
                const cardWidth = 552;

                // Card background with shadow effect (simulated by drawing a gray box behind)
                doc.roundedRect(cardX + 4, cardY + 4, cardWidth, 680, 8)
                    .fill('#E5E7EB'); // Shadow

                doc.roundedRect(cardX, cardY, cardWidth, 680, 8)
                    .fill('#FFFFFF'); // Main Card

                // ===== EVENT POSTER/BANNER SECTION =====
                let currentY = cardY;
                const posterHeight = 180; // Taller poster for impact

                // Clip the poster to the rounded top of the card
                doc.save();
                doc.roundedRect(cardX, cardY, cardWidth, posterHeight, 8)
                    .clip();

                let posterLoaded = false;
                if (booking.poster_url) {
                    try {
                        const imgRes = await axios.get(booking.poster_url, {
                            responseType: "arraybuffer",
                            timeout: 4000
                        });
                        const imgBuffer = Buffer.from(imgRes.data);

                        // Cover Image
                        doc.image(imgBuffer, cardX, cardY, {
                            fit: [cardWidth, posterHeight],
                            align: 'center',
                            valign: 'center'
                        });
                        posterLoaded = true;
                    } catch (err) {
                        console.log("Poster failed, using fallback.");
                    }
                }

                if (!posterLoaded) {
                    // Fallback for Sports vs Movies
                    const fallbackUrl = isSports
                        ? 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=1000' // Stadium
                        : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1000'; // Cinema

                    try {
                        const fbRes = await axios.get(fallbackUrl, {
                            responseType: "arraybuffer",
                            timeout: 5000
                        });
                        doc.image(Buffer.from(fbRes.data), cardX, cardY, {
                            fit: [cardWidth, posterHeight],
                            align: 'center',
                            valign: 'center'
                        });
                    } catch (e) {
                        console.log("Fallback image also failed, using solid color.");
                        // Ultimate fallback: Solid Color
                        doc.save();
                        doc.rect(cardX, cardY, cardWidth, posterHeight).fill(themeColor);
                        doc.restore();
                    }
                }

                // Gradient Overlay on Poster Bottom (Simulated with semi-transparent rects)
                // pdfkit doesn't support alpha gradients easily, so we skip complex gradients
                // Instead, add a dark banner at bottom of poster
                doc.restore(); // Restore clipping

                // Badge Overlay
                if (isSports) {
                    doc.roundedRect(cardX + 20, cardY + posterHeight - 30, 100, 24, 12)
                        .fill('#FBBF24');
                    doc.fontSize(10).fillColor('#000000').font('Helvetica-Bold')
                        .text('WORLD CUP', cardX + 35, cardY + posterHeight - 24);
                }


                currentY += posterHeight + 15;

                // Event title below poster
                doc.fontSize(16)
                    .fillColor('#1F2937')
                    .font('Helvetica-Bold')
                    .text(booking.event_title, cardX + 30, currentY, { width: cardWidth - 60 });

                currentY += 35;

                // Separator
                doc.moveTo(cardX + 30, currentY)
                    .lineTo(cardX + cardWidth - 30, currentY)
                    .strokeColor('#E5E7EB')
                    .lineWidth(1)
                    .stroke();

                currentY += 20;

                // ===== TWO-COLUMN DETAILS =====
                const leftCol = cardX + 30;
                const rightCol = cardX + 300;

                // DATE
                doc.fontSize(7)
                    .fillColor('#9CA3AF')
                    .font('Helvetica')
                    .text('DATE', leftCol, currentY);

                doc.fontSize(11)
                    .fillColor('#1F2937')
                    .font('Helvetica-Bold')
                    .text(booking.event_date, leftCol, currentY + 12);

                // VENUE
                doc.fontSize(7)
                    .fillColor('#9CA3AF')
                    .font('Helvetica')
                    .text('VENUE', rightCol, currentY);

                doc.fontSize(11)
                    .fillColor('#1F2937')
                    .font('Helvetica-Bold')
                    .text(booking.venue, rightCol, currentY + 12, { width: 240 });

                currentY += 45;

                // TIME
                doc.fontSize(7)
                    .fillColor('#9CA3AF')
                    .font('Helvetica')
                    .text('TIME', leftCol, currentY);

                doc.fontSize(11)
                    .fillColor('#1F2937')
                    .font('Helvetica-Bold')
                    .text(booking.event_time, leftCol, currentY + 12);

                // SEAT
                doc.fontSize(7)
                    .fillColor('#9CA3AF')
                    .font('Helvetica')
                    .text('SEAT', rightCol, currentY);

                doc.fontSize(11)
                    .fillColor('#1F2937')
                    .font('Helvetica-Bold')
                    .text(booking.seats.join(', '), rightCol, currentY + 12);

                currentY += 45;

                // Separator
                doc.moveTo(cardX + 30, currentY)
                    .lineTo(cardX + cardWidth - 30, currentY)
                    .strokeColor('#E5E7EB')
                    .lineWidth(1)
                    .stroke();

                currentY += 20;

                // TICKET HOLDER & TOTAL PAID
                doc.fontSize(7)
                    .fillColor('#9CA3AF')
                    .font('Helvetica')
                    .text('TICKET HOLDER', leftCol, currentY);

                doc.fontSize(10)
                    .fillColor('#1F2937')
                    .font('Helvetica-Bold')
                    .text(booking.user_email, leftCol, currentY + 12, { width: 240 });

                doc.fontSize(7)
                    .fillColor('#9CA3AF')
                    .font('Helvetica')
                    .text('TOTAL PAID', rightCol, currentY);

                doc.fontSize(15)
                    .fillColor('#10B981')
                    .font('Helvetica-Bold')
                    .text(`Rs. ${booking.amount_paid}`, rightCol, currentY + 10);

                currentY += 50;

                // ===== QR CODE SECTION (PROPERLY SIZED) =====
                doc.fontSize(9)
                    .fillColor('#1F2937')
                    .font('Helvetica-Bold')
                    .text('Entry QR Code', 0, currentY, { width: pageWidth, align: 'center' });

                doc.fontSize(7)
                    .fillColor('#6B7280')
                    .font('Helvetica')
                    .text('Scan this code at the venue entrance', 0, currentY + 14, { width: pageWidth, align: 'center' });

                currentY += 32;

                if (qrDataUrl) {
                    const qrSize = 150;
                    const qrX = (pageWidth - qrSize) / 2;

                    // Purple background
                    doc.rect(qrX - 8, currentY - 8, qrSize + 16, qrSize + 16)
                        .fill('#7C3AED');

                    // White inner
                    doc.rect(qrX - 3, currentY - 3, qrSize + 6, qrSize + 6)
                        .fill('#FFFFFF');

                    // QR Code
                    const qrBase64 = qrDataUrl.replace(/^data:image\/png;base64,/, "");
                    const qrBuffer = Buffer.from(qrBase64, "base64");
                    doc.image(qrBuffer, qrX + 15, currentY + 15, { width: 120, height: 120 });

                    currentY += qrSize + 16;
                }

                currentY += 10;

                // Validity notice
                const seatCount = booking.seats.length;
                const validityText = seatCount === 1
                    ? 'Valid for 1 person entry only.'
                    : `Valid for ${seatCount} persons entry (${booking.seats.join(', ')}).`;

                doc.fontSize(6)
                    .fillColor('#6B7280')
                    .font('Helvetica')
                    .text(validityText + ' Please arrive 30 minutes early.', 0, currentY, { width: pageWidth, align: 'center' });

                currentY += 20;

                // ===== FOOTER SECTION (OPTIMIZED SPACE) =====
                const footerY = currentY;

                // Footer background
                doc.rect(cardX, footerY, cardWidth, 90)
                    .fill('#F9FAFB');

                // TERMS & CONDITIONS (Left)
                doc.fontSize(7)
                    .fillColor('#1F2937')
                    .font('Helvetica-Bold')
                    .text('TERMS & CONDITIONS', cardX + 25, footerY + 12);

                doc.fontSize(6)
                    .fillColor('#6B7280')
                    .font('Helvetica')
                    .text('Please arrive at least 30 minutes before the event starts. Latecomers may not be permitted until a suitable break. This ticket is non-refundable and non-transferable unless specified otherwise.',
                        cardX + 25, footerY + 25, { width: 250, lineGap: 1.2 });

                // NEED HELP? (Right)
                doc.fontSize(7)
                    .fillColor('#1F2937')
                    .font('Helvetica-Bold')
                    .text('NEED HELP?', cardX + 295, footerY + 12);

                doc.fontSize(6)
                    .fillColor('#6B7280')
                    .font('Helvetica')
                    .text('If you encounter any issues, visit our support center at help.eventory.com or contact the venue directly at +44 20 7946 0000.',
                        cardX + 295, footerY + 25, { width: 245, lineGap: 1.2 });

                // Bottom text
                doc.fontSize(5.5)
                    .fillColor('#9CA3AF')
                    .font('Helvetica')
                    .text('GENERATED BY EVENTORY TICKETING SYSTEMS • SECURE PAYMENT PROCESSED BY STRIPE',
                        0, footerY + 73, { width: pageWidth, align: 'center' });

                doc.end();

            } catch (error) {
                console.error("PDF Generation Error:", error);
                reject(error);
            }
        });
    }
};