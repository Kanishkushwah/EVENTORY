import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

export const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_APP_PASSWORD,
    },
});

// Remove verify connection on startup since it causes connection timeout on Render Free tier
/*
transporter.verify((error) => {
    if (error) {
        console.error("❌ Email configuration error:", error);
    } else {
        console.log("✅ Email service is ready to send messages");
    }
});
*/