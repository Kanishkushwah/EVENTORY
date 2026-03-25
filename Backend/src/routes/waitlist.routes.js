import express from "express";
import { supabase } from "../config/supabase.js";
import { transporter } from "../config/email.js";

const router = express.Router();

// POST /api/waitlist  — Join waitlist for a sold-out event
router.post("/", async (req, res) => {
    const { email, eventId, eventTitle, eventDate } = req.body;
    if (!email || !eventId) return res.status(400).json({ success: false, message: "email and eventId required" });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return res.status(400).json({ success: false, message: "Invalid email" });

    try {
        // Store in Supabase waitlist table (create if needed via SQL)
        const { error } = await supabase.from("waitlist").insert({
            email,
            event_id: eventId,
            event_title: eventTitle,
            event_date: eventDate || null,
            joined_at: new Date().toISOString(),
            notified: false
        });

        if (error && !error.message.includes("duplicate")) {
            console.error("Waitlist insert error:", error);
            return res.status(500).json({ success: false, message: "Failed to join waitlist" });
        }

        // Send confirmation email
        await transporter.sendMail({
            from: `"Eventory 🎬" <${process.env.SMTP_EMAIL || "eventorytickets@gmail.com"}>`,
            to: email,
            subject: `✅ You're on the waitlist for "${eventTitle}"`,
            html: `
<!DOCTYPE html><html><body style="margin:0;padding:0;background:#0f0c29;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
<tr><td align="center">
<table width="600" style="max-width:600px;background:rgba(255,255,255,0.05);border-radius:24px;overflow:hidden;border:1px solid rgba(255,255,255,0.1);">
<tr><td style="background:linear-gradient(135deg,#6B46C1,#805AD5);padding:32px 40px;text-align:center;">
    <h1 style="color:#fff;margin:0;font-size:26px;font-weight:900;">🎬 Eventory</h1>
    <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:14px;">You're on the list!</p>
</td></tr>
<tr><td style="padding:40px;color:#fff;text-align:center;">
    <div style="font-size:52px;margin-bottom:16px;">🎫</div>
    <h2 style="margin:0 0 8px;font-size:22px;font-weight:800;">You're on the Waitlist!</h2>
    <p style="color:rgba(255,255,255,0.7);margin:0 0 24px;">We'll email you <strong>the moment</strong> a seat opens up for:</p>
    <div style="background:rgba(107,70,193,0.3);border:1px solid rgba(107,70,193,0.5);border-radius:16px;padding:20px;margin-bottom:24px;">
        <h3 style="margin:0 0 8px;font-size:20px;font-weight:800;color:#FBBF24;">${eventTitle}</h3>
        ${eventDate ? `<p style="margin:0;color:rgba(255,255,255,0.7);">🗓 ${new Date(eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>` : ''}
    </div>
    <p style="color:rgba(255,255,255,0.6);font-size:14px;line-height:1.6;">Spots are claimed fast — once we notify you, book immediately to secure your seat.</p>
    <a href="https://eventory-cyzy.onrender.com" style="display:inline-block;margin-top:20px;background:linear-gradient(135deg,#6B46C1,#805AD5);color:#fff;text-decoration:none;padding:14px 32px;border-radius:50px;font-weight:700;font-size:14px;">Browse Other Events →</a>
</td></tr>
<tr><td style="padding:20px 40px;border-top:1px solid rgba(255,255,255,0.1);text-align:center;">
    <p style="color:rgba(255,255,255,0.4);font-size:12px;margin:0;">© 2026 Eventory. You joined the waitlist for ${eventTitle}.</p>
</td></tr>
</table></td></tr></table>
</body></html>`
        });

        return res.json({ success: true, message: `Added to waitlist! Confirmation sent to ${email}` });
    } catch (err) {
        console.error("Waitlist error:", err);
        return res.status(500).json({ success: false, message: "Failed. Please try again." });
    }
});

// POST /api/waitlist/notify  — Admin triggers notification when seat opens
router.post("/notify", async (req, res) => {
    const { eventId } = req.body;
    if (!eventId) return res.status(400).json({ success: false, message: "eventId required" });

    try {
        const { data: waiters, error } = await supabase
            .from("waitlist")
            .select("*")
            .eq("event_id", eventId)
            .eq("notified", false)
            .order("joined_at", { ascending: true })
            .limit(5); // Notify first 5 in queue

        if (error) return res.status(500).json({ success: false, message: "DB error" });
        if (!waiters || waiters.length === 0) return res.json({ success: true, message: "No one on waitlist" });

        let notified = 0;
        for (const waiter of waiters) {
            await transporter.sendMail({
                from: `"Eventory 🎬" <${process.env.SMTP_EMAIL || "eventorytickets@gmail.com"}>`,
                to: waiter.email,
                subject: `🎉 A seat just opened for "${waiter.event_title}" — Book Now!`,
                html: `
<body style="font-family:'Segoe UI',Arial,sans-serif;background:#f9fafb;padding:40px 20px;text-align:center;">
<div style="max-width:600px;margin:0 auto;background:#fff;border-radius:24px;overflow:hidden;border:1px solid #e5e7eb;">
<div style="background:linear-gradient(135deg,#059669,#10B981);padding:32px 40px;">
    <h1 style="color:#fff;margin:0;font-size:26px;font-weight:900;">🎬 Eventory</h1>
</div>
<div style="padding:40px;">
    <div style="font-size:52px;margin-bottom:16px;">🎟️</div>
    <h2 style="color:#111;font-size:24px;font-weight:800;">A Seat is Available!</h2>
    <p style="color:#6b7280;margin:0 0 20px;">A seat just opened up for <strong style="color:#059669;">${waiter.event_title}</strong>. You're among the first to be notified — book before it's gone!</p>
    <a href="https://eventory-cyzy.onrender.com/index.html" style="display:inline-block;background:linear-gradient(135deg,#059669,#10B981);color:#fff;text-decoration:none;padding:16px 36px;border-radius:50px;font-weight:800;font-size:16px;">Book My Seat Now →</a>
    <p style="color:#9ca3af;font-size:12px;margin-top:24px;">This link is time-sensitive. Seats may sell quickly.</p>
</div>
</div></body>`
            });

            await supabase.from("waitlist").update({ notified: true, notified_at: new Date().toISOString() }).eq("id", waiter.id);
            notified++;
        }

        return res.json({ success: true, message: `Notified ${notified} people from waitlist` });
    } catch (err) {
        console.error("Waitlist notify error:", err);
        return res.status(500).json({ success: false, message: "Failed to notify" });
    }
});

export default router;
