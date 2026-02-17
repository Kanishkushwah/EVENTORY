# 🚀 Deployment Guide for Eventory

This guide will help you deploy your full-stack application (Frontend + Backend) to **Render.com** (Free Hosting).

---

## 🏗️ Step 1: Prepare for Deployment

Before pushing to GitHub, we need to bundle your Frontend (`EVENTHUB`) into the Backend folder so it can be served.

1.  Open Terminal in `Backend` folder.
2.  Run the predeploy script:
    ```bash
    npm run predeploy
    ```
    ✅ This will copy all files from `../EVENTHUB` into `Backend/src/public`.

---

## 🐙 Step 2: Push to GitHub

1.  Create a **New Repository** on GitHub.
2.  Push your entire project (or just the `Backend` folder if valid) to GitHub.
    *   Ideally, push the root folder including `Backend` and `EVENTHUB`.
    *   Make sure `.gitignore` exists in `Backend` so `node_modules` are NOT uploaded.

---

## ☁️ Step 3: Deploy on Render.com

1.  Go to [Render.com](https://render.com) and Sign Up/Login.
2.  Click **"New +"** -> **"Web Service"**.
3.  Connect your GitHub Repository.
4.  **Configure the Service:**
    *   **Name:** `eventory-app` (or similar)
    *   **Root Directory:** `Backend` (Important since your app is in a subfolder!)
    *   **Environment:** `Node`
    *   **Build Command:** `npm install`
    *   **Start Command:** `npm start`
    *   **Instance Type:** Free

5.  **Add Environment Variables:**
    Scroll down to **"Advanced"** -> **"Environment Variables"** and add these from your `.env` file:
    
    | Key | Value (Example) |
    | :--- | :--- |
    | `SUPABASE_URL` | `your_supabase_url` |
    | `SUPABASE_KEY` | `your_supabase_key` |
    | `TMDB_API_KEY` | `your_tmdb_key` |
    | `SMTP_EMAIL` | `your_email` |
    | `SMTP_APP_PASSWORD` | `your_app_password` |
    | `ADMIN_EMAIL` | `admin@ventory.com` |
    | `ADMIN_PASSWORD` | `123456` |
    | `SESSION_SECRET` | `generate_random_string` |
    | `GOOGLE_CLIENT_ID` | `...` |
    | `GOOGLE_CLIENT_SECRET` | `...` |
    | `GOOGLE_CALLBACK_URL` | `https://your-app-name.onrender.com/auth/google/callback` (Update this!) |

    ⚠️ **Critical:** Update `GOOGLE_CALLBACK_URL` to your new Render URL (e.g., `https://eventory.onrender.com/auth/google/callback`).
    Also update in **Google Cloud Console** -> "Authorized redirect URIs".

6.  Click **"Create Web Service"**.

---

## 🎉 Done!

Your website will be live at `https://your-app-name.onrender.com`.
It will serve:
*   Frontend at `/` (e.g., `index.html`)
*   API at `/api/...`

---

### 🔄 Updating After Changes

Whenever you change Frontend code:
1.  Run `npm run predeploy` locally.
2.  Commit & Push to GitHub.
3.  Render will auto-deploy!
