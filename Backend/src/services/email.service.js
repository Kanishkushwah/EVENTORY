import { transporter } from "../config/email.js";
import { getEmailTemplate } from "../utils/emailTemplate.js";

export const EmailService = {
    /**
     * Send booking confirmation email with PDF ticket
     */
    async sendBookingEmail(userEmail, booking, pdfBuffer) {
        try {
            const htmlContent = getEmailTemplate(booking);

            const mailOptions = {
                from: `"Eventory Tickets" <${process.env.SMTP_EMAIL || "eventorytickets@gmail.com"}>`,
                to: userEmail,
                subject: `🎟️ Booking Confirmed: ${booking.event_title}`,
                html: htmlContent,
                attachments: [
                    {
                        filename: `Eventory-Ticket-${booking.reference}.pdf`,
                        content: pdfBuffer,
                        contentType: "application/pdf"
                    }
                ]
            };

            const info = await transporter.sendMail(mailOptions);
            console.log("✅ Email sent successfully:", info.messageId);

            return {
                success: true,
                messageId: info.messageId
            };

        } catch (error) {
            console.error("❌ Email sending failed:", error);
            throw new Error("Failed to send confirmation email");
        }
    },

    /**
     * Send an ultra-fast receipt to the user immediately after payment
     * (Before PDF generation completes)
     */
    async sendInstantReceipt(userEmail, booking) {
        try {
            const mailOptions = {
                from: `"Eventory" <${process.env.SMTP_EMAIL || "eventorytickets@gmail.com"}>`,
                to: userEmail,
                subject: `✅ Payment Received: Ticket for ${booking.event_title} Coming Soon!`,
                html: `
                    <div style="font-family: Arial, sans-serif; padding: 20px;">
                        <h2 style="color: #7C3AED;">Payment Confirmed! 🎉</h2>
                        <p>We've received your payment of <b>₹${booking.amount_paid}</b> for "${booking.event_title}".</p>
                        <p>Your official ticket (PDF + QR) is being generated right now and will arrive in your inbox in less than 60 seconds.</p>
                        <hr style="border: 0; border-top: 1px solid #eee;" />
                        <p style="font-size: 12px; color: #666;">Booking Ref: <b>${booking.reference}</b></p>
                    </div>
                `,
            };
            const info = await transporter.sendMail(mailOptions);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error("❌ Instant Receipt Error:", error);
            return { success: false };
        }
    },

    /**
     * Generic send email for reminders and reviews
     */
    async sendEmail({ to, subject, html, attachments = [] }) {
        try {
            const mailOptions = {
                from: `"Eventory" <${process.env.SMTP_EMAIL || "eventorytickets@gmail.com"}>`,
                to,
                subject,
                html,
                attachments
            };
            const info = await transporter.sendMail(mailOptions);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error("❌ Generic Email Error:", error);
            throw error;
        }
    },

    /**
     * Legacy method - kept for backward compatibility
     */
    async sendTicket({ to, subject, attachment }) {
        try {
            await transporter.sendMail({
                from: process.env.SMTP_EMAIL,
                to,
                subject,
                text: "Your Eventory ticket is attached.",
                attachments: [
                    {
                        filename: "Eventory-Ticket.pdf",
                        path: attachment,
                        contentType: "application/pdf"
                    }
                ]
            });
            console.log("✅ Ticket email sent to:", to);
        } catch (error) {
            console.error("❌ Ticket email error:", error);
            throw error;
        }
    }
};