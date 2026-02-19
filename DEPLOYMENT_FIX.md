# 🚨 CRITICAL DEPLOYMENT FIX

The "Failed to load booking details" error is caused because the Render server cannot access the database rows due to Row Level Security (RLS).

This happens because the **Environment Variable `SUPABASE_KEY` on Render is likely set to the Anon/Public Key instead of the Service Role Key.**

### **HOW TO FIX (Required)**

1.  **Open your local file:** `Backend/.env`
2.  **Copy the value of `SUPABASE_KEY`.**
    *   (It should verify by decoding the JWT, look for `"role": "service_role"`).
    *   The value likely starts with `eyJhbG...` but contains `service_role` in the middle if decoded.
3.  **Go to Render Dashboard:**
    *   Select your Backend Service (`eventory-backend` or similiar).
    *   Go to **Environment**.
    *   Find `SUPABASE_KEY`.
    *   **Click Edit** and paste the key you copied from your local `.env`.
    *   **Save Changes**.
4.  **Redeploy** (or it might auto-redeploy).

Once this is done, the Backend will reference the database as Admin/Service Role, bypassing the RLS restriction that blocks the "Get Booking" request.

### **Why did it work locally?**
Because your local `.env` file has the correct Service Role Key, so `node debug-booking.js` worked perfectly. The deployed server is missing this key.
