import './src/config/index.js'; // Assuming dotenv is loaded here or similar
import dotenv from 'dotenv';
dotenv.config();

import { supabase } from './src/config/supabase.js';
import { PdfService } from './src/services/pdf.service.js';
import { QRService } from './src/services/qr.service.js';
import { EmailService } from './src/services/email.service.js';

async function test() {
  try {
    const { data: booking, error } = await supabase.from('bookings').select('*').eq('reference', 'EVT-20260225-X48AW8').single();
    if (error) { console.error('Supabase error:', error); return; }

    console.log("Generating QR...");
    const qrDataUrl = await QRService.generateQR(booking.reference);

    console.log("Generating PDF...");
    const pdfBuffer = await PdfService.generateTicketPDF(booking, qrDataUrl);

    console.log("Sending Email...");
    await EmailService.sendBookingEmail(booking.user_email, booking, pdfBuffer);
    console.log("Done!");
  } catch (e) {
    console.error("Test Error:", e);
  }
}
test();
