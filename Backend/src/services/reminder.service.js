import cron from "node-cron";
import { supabase } from "../config/supabase.js";
import { EmailService } from "./email.service.js";

export const ReminderService = {
    init() {
        console.log("⏰ Smart Reminder Service initialized.");

        // Run every hour to catch 2-hr window
        cron.schedule("0 * * * *", async () => {
            const now = new Date();
            console.log(`🔔 Hourly reminder check at ${now.toISOString()}`);
            await this.sendSmartReminders();
        });

        // Run daily at 8 AM for 7-day and morning-of reminders
        cron.schedule("0 8 * * *", async () => {
            console.log("🚀 Daily 8AM Reminder Job...");
            await this.sendDailyReminders();
        });

        // Run daily at 11 PM to send post-event review requests
        cron.schedule("0 23 * * *", async () => {
            console.log("⭐ Post-event review request job...");
            await this.sendReviewRequests();
        });
    },

    // ─── Fetch all completed bookings ────────────────────────────────────
    async getCompletedBookings() {
        const { data, error } = await supabase
            .from("bookings")
            .select("*")
            .eq("payment_status", "completed");
        if (error) {
            console.error("Reminder DB Error:", error);
            return [];
        }
        return data || [];
    },

    // ─── Smart reminders: runs every hour ────────────────────────────────
    async sendSmartReminders() {
        const bookings = await this.getCompletedBookings();
        let sent = 0;

        for (const booking of bookings) {
            const eventTs = new Date(booking.event_date).getTime();
            const now = Date.now();
            const hoursUntil = (eventTs - now) / (1000 * 60 * 60);

            // 2-hour reminder window (1.5h to 2.5h before event)
            if (hoursUntil >= 1.5 && hoursUntil <= 2.5 && !booking.reminder_2h_sent) {
                await this._send2HourReminder(booking);
                await supabase.from("bookings").update({ reminder_2h_sent: true }).eq("reference", booking.reference);
                sent++;
            }
        }
        if (sent > 0) console.log(`✅ 2-hour reminders sent: ${sent}`);
    },

    // ─── Daily reminders: 7-day + morning-of ─────────────────────────────
    async sendDailyReminders() {
        const bookings = await this.getCompletedBookings();
        let sent7Day = 0, sentMorning = 0;

        for (const booking of bookings) {
            const eventTs = new Date(booking.event_date).getTime();
            const now = Date.now();
            const hoursUntil = (eventTs - now) / (1000 * 60 * 60);

            // 7-day reminder (between 6.5 and 7.5 days before)
            if (hoursUntil >= 155 && hoursUntil <= 169 && !booking.reminder_7d_sent) {
                await this._send7DayReminder(booking);
                await supabase.from("bookings").update({ reminder_7d_sent: true }).eq("reference", booking.reference);
                sent7Day++;
            }

            // Morning-of reminder (0 to 10 hours before)
            if (hoursUntil >= 0 && hoursUntil <= 10 && !booking.reminder_morning_sent) {
                await this._sendMorningReminder(booking);
                await supabase.from("bookings").update({ reminder_morning_sent: true }).eq("reference", booking.reference);
                sentMorning++;
            }
        }

        if (sent7Day > 0) console.log(`✅ 7-day reminders sent: ${sent7Day}`);
        if (sentMorning > 0) console.log(`✅ Morning-of reminders sent: ${sentMorning}`);
    },

    // ─── Post-event review requests ───────────────────────────────────────
    async sendReviewRequests() {
        const bookings = await this.getCompletedBookings();
        let sent = 0;

        for (const booking of bookings) {
            const eventTs = new Date(booking.event_date).getTime();
            const now = Date.now();
            const hoursAgo = (now - eventTs) / (1000 * 60 * 60);

            // Send review request 6-30 hours after event ended
            if (hoursAgo >= 6 && hoursAgo <= 30 && !booking.review_request_sent) {
                await this._sendReviewRequest(booking);
                await supabase.from("bookings").update({ review_request_sent: true }).eq("reference", booking.reference);
                sent++;
            }
        }
        if (sent > 0) console.log(`⭐ Review requests sent: ${sent}`);
    },

    // ─── Email Templates ──────────────────────────────────────────────────

    async _send7DayReminder(booking) {
        const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(booking.venue)}`;
        await EmailService.sendEmail({
            to: booking.user_email,
            subject: `📅 1 Week Until "${booking.event_title}" — Get Ready!`,
            html: this._buildEmail({
                emoji: "📅",
                headline: "One Week to Go!",
                subline: `Your event is coming up in 7 days. Mark the date and get excited!`,
                accentColor: "#6B46C1",
                booking,
                extraCopy: "Start planning your outfit, arrange travel, and make sure your ticket is handy.",
                ctaLabel: "Get Directions",
                ctaUrl: mapsLink,
                badge: "7 DAYS AWAY"
            })
        });
    },

    async _send2HourReminder(booking) {
        const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(booking.venue)}`;
        const ticketUrl = `https://eventory-cyzy.onrender.com/payment.html?ref=${booking.reference}`;
        await EmailService.sendEmail({
            to: booking.user_email,
            subject: `⏰ "${booking.event_title}" starts in 2 hours! Your ticket inside`,
            html: this._buildEmail({
                emoji: "⏰",
                headline: "Almost Time!",
                subline: `Your event starts in about 2 hours. Head out now to avoid rush!`,
                accentColor: "#D97706",
                booking,
                extraCopy: "Carry a valid ID and your digital ticket. Gates typically open 30 minutes before start.",
                ctaLabel: "View My Ticket",
                ctaUrl: ticketUrl,
                badge: "2 HOURS TO GO"
            })
        });
    },

    async _sendMorningReminder(booking) {
        const ticketUrl = `https://eventory-cyzy.onrender.com/payment.html?ref=${booking.reference}`;
        await EmailService.sendEmail({
            to: booking.user_email,
            subject: `🎬 Today's the Day! "${booking.event_title}" — Ticket & Details`,
            html: this._buildEmail({
                emoji: "🎉",
                headline: "Today's the Day!",
                subline: `"${booking.event_title}" is happening today. Have an amazing time!`,
                accentColor: "#059669",
                booking,
                extraCopy: "Tap below to view your digital ticket. Save it to your phone for quick access at the venue.",
                ctaLabel: "Open My Ticket",
                ctaUrl: ticketUrl,
                badge: "TODAY"
            })
        });
    },

    async _sendReviewRequest(booking) {
        const reviewUrl = `https://eventory-cyzy.onrender.com/index.html?review=${booking.reference}`;
        await EmailService.sendEmail({
            to: booking.user_email,
            subject: `⭐ How was "${booking.event_title}"? Leave a quick review`,
            html: `
<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f9fafb;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
<tr><td align="center">
<table width="600" style="max-width:600px;background:#fff;border-radius:24px;overflow:hidden;border:1px solid #e5e7eb;">
<tr><td style="background:linear-gradient(135deg,#6B46C1,#805AD5);padding:32px 40px;text-align:center;">
    <h1 style="color:#fff;margin:0;font-size:26px;font-weight:900;">🎬 Eventory</h1>
</td></tr>
<tr><td style="padding:40px;text-align:center;">
    <div style="font-size:56px;margin-bottom:16px;">⭐</div>
    <h2 style="color:#111;font-size:22px;font-weight:800;margin:0 0 8px;">How was the experience?</h2>
    <p style="color:#6b7280;margin:0 0 8px;">We hope you had a great time at</p>
    <p style="color:#6B46C1;font-weight:800;font-size:18px;margin:0 0 24px;">${booking.event_title}</p>
    <div style="display:flex;justify-content:center;gap:8px;margin-bottom:28px;">
        ${[1, 2, 3, 4, 5].map(n => `<a href="${reviewUrl}&stars=${n}" style="font-size:36px;text-decoration:none;">⭐</a>`).join('')}
    </div>
    <p style="color:#6b7280;font-size:14px;">Your review helps other fans discover great events.</p>
    <a href="${reviewUrl}" style="display:inline-block;margin-top:20px;background:linear-gradient(135deg,#6B46C1,#805AD5);color:#fff;text-decoration:none;padding:14px 32px;border-radius:50px;font-weight:700;font-size:15px;">Rate Your Experience →</a>
</td></tr>
<tr><td style="padding:20px 40px;border-top:1px solid #f3f4f6;text-align:center;">
    <p style="color:#9ca3af;font-size:12px;margin:0;">© 2026 Eventory. Booking Ref: ${booking.reference}</p>
</td></tr>
</table></td></tr></table>
</body></html>`
        });
    },

    // ─── Shared email template builder ────────────────────────────────────
    _buildEmail({ emoji, headline, subline, accentColor, booking, extraCopy, ctaLabel, ctaUrl, badge }) {
        const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(booking.venue)}`;
        return `
<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f9fafb;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
<tr><td align="center">
<table width="600" style="max-width:600px;background:#fff;border-radius:24px;overflow:hidden;border:1px solid #e5e7eb;">
<tr><td style="background:linear-gradient(135deg,${accentColor},${accentColor}cc);padding:32px 40px;text-align:center;">
    <div style="display:inline-block;background:rgba(255,255,255,0.15);border-radius:99px;padding:4px 16px;color:rgba(255,255,255,0.9);font-size:11px;font-weight:800;letter-spacing:2px;margin-bottom:12px;">${badge}</div>
    <h1 style="color:#fff;margin:0;font-size:26px;font-weight:900;">🎬 Eventory</h1>
</td></tr>
<tr><td style="padding:40px;">
    <div style="text-align:center;margin-bottom:28px;">
        <div style="font-size:52px;">${emoji}</div>
        <h2 style="color:#111;font-size:22px;font-weight:800;margin:8px 0;">${headline}</h2>
        <p style="color:#6b7280;margin:0;">${subline}</p>
    </div>
    <div style="background:#f3f4f6;border-radius:16px;padding:24px;margin-bottom:24px;">
        <h3 style="margin:0 0 16px;color:${accentColor};font-size:18px;font-weight:800;">${booking.event_title}</h3>
        <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="padding:6px 0;color:#6b7280;font-size:14px;">📅 Date</td><td style="padding:6px 0;font-weight:700;font-size:14px;text-align:right;">${booking.event_date}</td></tr>
            <tr><td style="padding:6px 0;color:#6b7280;font-size:14px;">⏰ Time</td><td style="padding:6px 0;font-weight:700;font-size:14px;text-align:right;">${booking.event_time}</td></tr>
            <tr><td style="padding:6px 0;color:#6b7280;font-size:14px;">📍 Venue</td><td style="padding:6px 0;font-weight:700;font-size:14px;text-align:right;">${booking.venue}</td></tr>
            <tr><td style="padding:6px 0;color:#6b7280;font-size:14px;">🪑 Seats</td><td style="padding:6px 0;font-weight:700;font-size:14px;text-align:right;">${Array.isArray(booking.seats) ? booking.seats.join(', ') : booking.seats}</td></tr>
            <tr><td style="padding:6px 0;color:#6b7280;font-size:14px;">🎟 Reference</td><td style="padding:6px 0;font-weight:700;font-size:14px;text-align:right;font-family:monospace;color:${accentColor};">${booking.reference}</td></tr>
        </table>
    </div>
    <p style="color:#6b7280;font-size:14px;line-height:1.6;">${extraCopy}</p>
    <div style="text-align:center;margin-top:28px;display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
        <a href="${ctaUrl}" style="display:inline-block;background:linear-gradient(135deg,${accentColor},${accentColor}cc);color:#fff;text-decoration:none;padding:14px 28px;border-radius:50px;font-weight:700;font-size:14px;">${ctaLabel} →</a>
        <a href="${mapsLink}" style="display:inline-block;background:#f3f4f6;color:#374151;text-decoration:none;padding:14px 28px;border-radius:50px;font-weight:700;font-size:14px;">📍 Get Directions</a>
    </div>
</td></tr>
<tr><td style="padding:20px 40px;border-top:1px solid #f3f4f6;text-align:center;">
    <p style="color:#9ca3af;font-size:12px;margin:0;">© 2026 Eventory. You received this reminder because you booked a ticket.<br>Ref: ${booking.reference}</p>
</td></tr>
</table></td></tr></table>
</body></html>`;
    }
};
