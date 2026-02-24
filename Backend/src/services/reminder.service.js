import cron from "node-cron";
import { supabase } from "../config/supabase.js";
import { EmailService } from "./email.service.js";

export const ReminderService = {
    init() {
        console.log("⏰ Upcoming Event Reminder Service initialized.");

        // Run every day at 8:00 AM server time
        cron.schedule("0 8 * * *", async () => {
            console.log("🚀 Running Daily Reminder Job...");
            await this.sendRemindersForTomorrow();
        });
    },

    async sendRemindersForTomorrow() {
        try {
            // Get tomorrow's date string in YYYY-MM-DD
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const tomorrowStr = tomorrow.toISOString().split("T")[0];

            // Because event_date in DB might be formatted differently (e.g. DD/MM/YYYY or YYYY-MM-DD),
            // We can do a smart fetch or fetch all upcoming and JS filter.
            // Let's fetch all paid bookings and filter in memory since we are not storing actual Date objects.
            const { data: bookings, error } = await supabase
                .from("bookings")
                .select("*")
                .eq("payment_status", "completed");

            if (error) {
                console.error("Reminder DB Error:", error);
                return;
            }

            if (!bookings || bookings.length === 0) return;

            let sentCount = 0;

            for (const booking of bookings) {
                // event_date format could be '2023-11-25' or 'November 25, 2023'
                // Let's parse both standardizing to Timestamp
                const eventTimestamp = new Date(booking.event_date).getTime();
                const now = new Date().getTime();

                // If the event is tomorrow (between 24 - 48 hours away)
                const hoursDiff = (eventTimestamp - now) / (1000 * 60 * 60);

                if (hoursDiff > 0 && hoursDiff <= 48) {
                    // Send Email
                    const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(booking.venue)}`;

                    const htmlContent = `
                        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4; text-align: center;">
                            <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; border-top: 5px solid #8b5cf6;">
                                <h1 style="color: #4c1d95;">It's Almost Time! ⏰</h1>
                                <p style="font-size: 16px; color: #333;">Hi there,</p>
                                <p style="font-size: 16px; color: #333;">This is a friendly reminder that your booking for <strong>${booking.event_title}</strong> is happening tomorrow!</p>
                                
                                <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: left;">
                                    <p>📅 <strong>Date:</strong> ${booking.event_date}</p>
                                    <p>⏰ <strong>Time:</strong> ${booking.event_time}</p>
                                    <p>📍 <strong>Venue:</strong> ${booking.venue}</p>
                                    <p>🪑 <strong>Seats:</strong> ${booking.seats?.join(", ") || 'N/A'}</p>
                                </div>

                                <a href="${mapsLink}" style="display: inline-block; padding: 12px 24px; background-color: #8b5cf6; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
                                    Get Directions on Maps
                                </a>

                                <p style="margin-top: 30px; font-size: 14px; color: #666;">
                                    Don't forget to bring your digital ticket. See you there!
                                </p>
                            </div>
                        </div>
                    `;

                    await EmailService.sendEmail({
                        to: booking.user_email,
                        subject: `Reminder: ${booking.event_title} is Tomorrow!`,
                        html: htmlContent
                    });

                    sentCount++;
                }
            }

            console.log(`✅ Reminder Job Finished. Sent ${sentCount} emails.`);

        } catch (err) {
            console.error("Reminder Job Exception:", err);
        }
    }
};
