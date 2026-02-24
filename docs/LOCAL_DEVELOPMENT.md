# Local development (localhost)

Run the app locally and still use the production n8n webhook and Supabase.

---

## Use the live site for portrait creation (simplest)

**Yes — it can all work using live URLs.** To avoid local upload or Storage issues:

- Open your **deployed site** (e.g. `https://yoursite.netlify.app/create`).
- Create portraits there. Uploads go from **Netlify** → Supabase Storage; n8n runs; callback goes to **Netlify** → Supabase. Everything uses the same live config.

Use **localhost** for UI and code changes; use the **live site** when you want to test the full create flow. No need to fix local Storage uploads unless you specifically need to run the full flow from your machine.

If you see **"Upload failed: fetch failed. Ensure Storage allows uploads to images/uploads/"** on localhost, that’s the local app uploading to Supabase (Storage policies or CORS can block it). Easiest fix: **test create on the live site** instead.

---

## 1. Environment variables (required for portrait creation on localhost)

Next.js loads **`.env.local`** in development. Without it, you get **"Portrait creation is not configured (N8N_WEBHOOK_URL missing)"**. The file must be in the **project root** (same folder as `package.json` and `next.config.mjs`).

1. Copy the example file:
   ```bash
   cp .env.example .env.local
   ```
2. Edit **`.env.local`** and set at least:
   - **NEXT_PUBLIC_SUPABASE_URL** – your Supabase project URL (same as production).
   - **NEXT_PUBLIC_SUPABASE_ANON_KEY** – your anon key (same as production).
   - **N8N_WEBHOOK_URL** – your n8n webhook URL (e.g. `https://your-n8n.com/webhook/transform-pet`). You can use the **same production webhook URL**; localhost will POST to it when you submit on /create.

Optional: **N8N_WEBHOOK_SECRET**, **N8N_PING_WEBHOOK_URL**, **GEMINI_API_KEY** (see .env.example).

After saving `.env.local`, **restart the dev server** (`npm run dev`). Env is loaded at startup only.

**Verify the app sees it:** Open **http://localhost:3000/api/env-check** in the browser. You should see `n8nWebhookConfigured: true`. If it’s `false`, the file is in the wrong place (must be project root), has a typo in the variable name, or the server wasn’t restarted.

---

## 2. Why “localhost doesn’t work with production details”

Portrait creation **does** work from localhost **if**:

- **.env.local** has **N8N_WEBHOOK_URL** (and Supabase) set.
- n8n can reach the **callback** URL (where n8n POSTs when the portrait is done).

The flow is: **Browser (localhost) → your app (localhost) → n8n webhook → n8n runs → n8n POSTs to your “receive-n8n-image” URL.**  
n8n runs on your server or cloud; it **cannot** call `http://localhost:3000/api/receive-n8n-image` unless you expose localhost (e.g. with a tunnel).

So you have two ways to use localhost with production n8n:

### Option A: n8n callback to Netlify (recommended, no tunnel)

- In n8n, the node that calls your app (Supabase / HTTP Request to **receive-n8n-image**) must use your **Netlify** URL, e.g.  
  `https://yoursite.netlify.app/api/receive-n8n-image`
- When you use **/create on localhost**: localhost uploads to Supabase and triggers n8n; n8n runs and then POSTs to **Netlify**; Netlify writes to Supabase. Your local **/create** page polls **Supabase** (same DB), so the new portrait row appears and the image shows.

So: **localhost for the UI**, **Netlify for the callback**. No tunnel needed.

### Option B: Full local callback (tunnel)

- Expose your local server with a tunnel (e.g. [ngrok](https://ngrok.com)): `ngrok http 3000`.
- In n8n, set the receive-n8n-image URL to the tunnel URL, e.g. `https://abc123.ngrok.io/api/receive-n8n-image`.
- Then the whole flow (trigger + callback) goes through your machine.

Use Option A unless you need to debug the callback API locally.

---

## 3. Port already in use (EADDRINUSE :::3000)

If `npm run start` or `npm run dev` fails with **address already in use :::3000**:

- **Use another port:**  
  `npm run start -- -p 3001`  
  or  
  `npm run dev -- -p 3001`  
  Then open http://localhost:3001/create (and /test-n8n).
- **Free port 3000:**  
  Find and stop the process using 3000, e.g. on macOS:
  ```bash
  lsof -ti:3000 | xargs kill
  ```
  Then run `npm run start` or `npm run dev` again.

---

## 4. Quick checklist

| Step | Action |
|------|--------|
| 1 | Copy `.env.example` to `.env.local` |
| 2 | Set `N8N_WEBHOOK_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local` |
| 3 | In n8n, keep the **receive-n8n-image** URL pointing to **Netlify** (Option A) so the callback works when you use localhost |
| 4 | Restart dev server; open http://localhost:3000/create (or the port you use) |
| 5 | If port 3000 is in use, run with `-p 3001` or kill the process on 3000 |

After this, portrait creation from localhost works with production n8n and Supabase.
