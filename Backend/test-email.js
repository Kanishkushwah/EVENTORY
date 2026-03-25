import dotenv from 'dotenv';
dotenv.config();

import { supabase } from './src/config/supabase.js';
import { PdfService } from './src/services/pdf.service.js';
import { QRService } from './src/services/qr.service.js';
import { EmailService } from './src/services/email.service.js';

async function test() {
  const reference = process.argv[2] || 'EVT-20260325-LUSYL0';
  console.log(`Testing with reference: ${reference}`);
  try {
    const { data: booking, error } = await supabase.from('bookings').select('*').eq('reference', reference).single();
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
