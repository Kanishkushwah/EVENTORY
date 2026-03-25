import express from "express";
import { supabase } from "../config/supabase.js";
import { transporter } from "../config/email.js";

const router = express.Router();

// POST /api/notify  — subscribe for a movie release notification
router.post("/", async (req, res) => {
  const { email, movieId, movieTitle, releaseDate } = req.body;

  if (!email || !movieId || !movieTitle) {
    return res.status(400).json({ success: false, message: "email, movieId and movieTitle are required" });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ success: false, message: "Invalid email address" });
  }

  try {
    // Upsert into Supabase — deduplicates via UNIQUE(email, movie_id)
    const { error: dbError } = await supabase
      .from("release_notifications")
      .upsert(
        {
          email,
          movie_id: String(movieId),
          movie_title: movieTitle,
          release_date: releaseDate || null,
          subscribed_at: new Date().toISOString(),
          notified: false
        },
        { onConflict: "email,movie_id", ignoreDuplicates: true }
      );

    if (dbError) {
      console.error("Notify subscribe DB error:", dbError);
      // Don't block the user — still try to send the email
    }

    // Send beautiful HTML confirmation email
    const formattedDate = releaseDate
      ? new Date(releaseDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
      : "Date TBA";

    await transporter.sendMail({
      from: `"Eventory 🎬" <${process.env.SMTP_EMAIL || "eventorytickets@gmail.com"}>`,
      to: email,
      subject: `🔔 You'll be notified when "${movieTitle}" releases!`,
      html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0f0c29;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#0f0c29,#302b63,#24243e);padding:40px 20px;">
    <tr><td align="center">
      <table width="600" style="max-width:600px;background:rgba(255,255,255,0.05);border-radius:24px;overflow:hidden;border:1px solid rgba(255,255,255,0.1);">
        <tr><td style="background:linear-gradient(135deg,#6B46C1,#805AD5);padding:32px 40px;text-align:center;">
          <h1 style="color:#fff;margin:0;font-size:28px;font-weight:900;letter-spacing:-0.5px;">🎬 Eventory</h1>
          <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:14px;">Your cinema partner</p>
        </td></tr>
        <tr><td style="padding:40px;color:#fff;">
          <div style="text-align:center;margin-bottom:32px;">
            <div style="width:70px;height:70px;background:linear-gradient(135deg,#6B46C1,#805AD5);border-radius:50%;display:inline-block;line-height:70px;font-size:32px;margin-bottom:16px;">🔔</div>
            <h2 style="margin:0;font-size:24px;font-weight:800;">Notification Set!</h2>
            <p style="color:rgba(255,255,255,0.7);margin:8px 0 0;">We'll alert you the moment tickets open.</p>
          </div>
          <div style="background:rgba(107,70,193,0.2);border:1px solid rgba(107,70,193,0.4);border-radius:16px;padding:24px;margin-bottom:24px;">
            <p style="margin:0 0 8px;color:rgba(255,255,255,0.6);font-size:12px;text-transform:uppercase;letter-spacing:1px;">Movie</p>
            <h3 style="margin:0;font-size:22px;font-weight:800;color:#FBBF24;">${movieTitle}</h3>
            <p style="margin:12px 0 0;color:rgba(255,255,255,0.8);font-size:15px;">🗓 Release Date: <strong style="color:#A78BFA;">${formattedDate}</strong></p>
          </div>
          <p style="color:rgba(255,255,255,0.7);line-height:1.6;font-size:15px;">We'll email you as soon as <strong style="color:#fff;">${movieTitle}</strong> is available for booking. Be the first to grab your seats!</p>
          <div style="text-align:center;margin:32px 0;">
            <a href="https://eventory-cyzy.onrender.com/releases.html" style="background:linear-gradient(135deg,#6B46C1,#805AD5);color:#fff;text-decoration:none;padding:14px 32px;border-radius:50px;font-weight:700;font-size:15px;display:inline-block;">Browse More Movies →</a>
          </div>
        </td></tr>
        <tr><td style="padding:20px 40px;border-top:1px solid rgba(255,255,255,0.1);text-align:center;">
          <p style="color:rgba(255,255,255,0.4);font-size:12px;margin:0;">© 2026 Eventory. You received this because you subscribed to release notifications.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
    });

    return res.json({ success: true, message: `Notification set! Confirmation sent to ${email}` });

  } catch (error) {
    console.error("Notify subscribe error:", error);
    return res.status(500).json({ success: false, message: "Subscription saved but confirmation email failed. Check email address." });
  }
});

// GET /api/notify/subscribers  — Admin: view all subscribers from Supabase
router.get("/subscribers", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("release_notifications")
      .select("*")
      .order("subscribed_at", { ascending: false });

    if (error) return res.status(500).json({ success: false, message: "DB error" });
    return res.json({ success: true, count: data.length, subscribers: data });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
