# Clear setup steps (in order)

Follow these steps once, in order. Check off each step before moving to the next.

---

## Step 1: Theme prompts table in Supabase

The API now validates themes using the `theme_prompts` table. If this table doesn’t exist, the app falls back to "fireman" and "spaceman" only.

**What to do:**

1. Open **Supabase Dashboard** → your project → **SQL Editor**.
2. Open the file **`supabase/run-create-theme-prompts-table.sql`** in your repo.
3. Copy its full contents and paste into the SQL Editor.
4. Click **Run**.
5. Confirm there are no errors (you should see “Success”).

**Then:**

6. Open **`supabase/run-seed-theme-prompts.sql`** in your repo.
7. Copy its full contents and paste into the SQL Editor.
8. Click **Run**.
9. Confirm no errors.

**Check:**

- In Supabase: **Table Editor** → open table **`theme_prompts`**.
- You should see 2 rows: `fireman` and `spaceman`, both with long prompt text and `active = true`.

---

## Step 2: Deploy the app

The code changes (theme from DB, webhook secret, 503 on n8n failure) only apply after a new deploy.

**What to do:**

1. Commit and push your code (if you haven’t already).
2. In **Netlify** → your site → **Deploys**: wait for the latest deploy to finish, or click **Trigger deploy** → **Deploy site**.
3. When the deploy is **Published**, the new API behavior is live.

**Check:**

- Visit **https://your-site.netlify.app/create** (or your real URL).
- Select a theme, upload a photo, submit. If the flow works end-to-end, Step 1 and 2 are good.

---

## Step 3: (Optional) Secure the n8n callback with a secret

This step is **optional**. If you skip it, the app still works, but anyone who knows the callback URL could send fake data. If you want to lock that down, do this once.

**3a – Set the secret in Netlify**

1. Generate a random secret, e.g. in a terminal:
   ```bash
   openssl rand -hex 24
   ```
   Copy the output (e.g. `a1b2c3d4e5...`).
2. In **Netlify** → your site → **Site settings** → **Environment variables**.
3. Click **Add a variable** or **Add single variable**.
4. **Key:** `N8N_WEBHOOK_SECRET`  
   **Value:** paste the secret you generated.  
   **Scopes:** leave default (e.g. All scopes) or select Production if you prefer.
5. Click **Save**.
6. Trigger a **new deploy** (Deploys → **Trigger deploy** → **Deploy site**) so the new variable is used.

**3b – Send the secret from n8n**

1. Open your **n8n** instance and the **transform-pet** workflow.
2. Click the node that **POSTs to your app** (the one that calls `https://your-site.netlify.app/api/receive-n8n-image` — often named “Supabase” or similar).
3. In that node, find **Headers** (or **Options** → **Headers**). If there is no Headers section, add one / expand it.
4. Add one header:
   - **Name:** `X-Webhook-Secret`
   - **Value:** the **exact same** secret you put in Netlify (no spaces before/after).
5. **Save** the workflow.
6. Ensure the workflow is **Active** (production).

**Check:**

- On your site, create a portrait again (theme + upload + submit).
- If the portrait appears in the gallery as before, the secret is correct.  
- If you get no portrait and n8n or your app logs show **401** from `/api/receive-n8n-image`, the secret in n8n and Netlify don’t match — fix the value in one place so they are identical and redeploy if you changed Netlify.

---

## Step 4: (Optional) Add a new theme later

When you want a new theme (e.g. “pirate”), you only touch Supabase and optionally the frontend — no change to the validation logic.

**4a – Theme image**

1. In **Supabase** → **Storage** → bucket **images** → folder **themes**.
2. Upload the master image with the exact name: **`pirate-master.png`** (or `yourtheme-master.png`). The name must be `{theme-name}-master.png`.

**4b – Theme prompt**

1. In **Supabase** → **SQL Editor**, run (replace the prompt text with yours):

```sql
INSERT INTO public.theme_prompts (theme_name, prompt, active)
VALUES (
  'pirate',
  'INSTRUCTION: Create a high-fidelity, photorealistic 16:9 WIDESCREEN pirate portrait.

1. SUBJECT: Use the pet from Image 2. This is the absolute identity lock...
(put your full prompt here, same style as fireman/spaceman)
',
  true
);
```

2. Run the query. The new theme is now valid for the API.

**4c – Show it in the UI (optional)**

If you want a “Pirate” button on `/create`:

1. In **`lib/themes.ts`**, add `"pirate"` to the list, e.g.  
   `export const VALID_THEMES = ["fireman", "spaceman", "pirate"] as const`
2. In **`app/create/page.tsx`**, add a third theme button (copy one of the existing theme buttons, change label to “Pirate”, `onClick` to `setTheme("pirate")`, and the preview image path to `/images/themes/pirate-preview.webp` or similar).
3. Add the file **`public/images/themes/pirate-preview.webp`** (or the path you used).
4. Commit, push, and let Netlify deploy.

---

## Quick reference

| Step | What | Required? |
|------|------|-----------|
| 1 | Create and seed `theme_prompts` in Supabase | Yes (for DB-driven themes) |
| 2 | Deploy the app on Netlify | Yes |
| 3 | Set `N8N_WEBHOOK_SECRET` in Netlify and in n8n header | Optional (recommended) |
| 4 | Add new themes (Storage + SQL ± UI) | Only when you add themes |

---

## If something goes wrong

- **“Please select a valid theme”**  
  Theme not in `theme_prompts` or not active. Check Supabase → Table Editor → `theme_prompts` and the theme name (lowercase, e.g. `fireman`).

- **“Portrait creation is temporarily unavailable”**  
  n8n didn’t accept the webhook (down, wrong URL, or workflow inactive). Check `N8N_WEBHOOK_URL` in Netlify and that the transform-pet workflow is Active in n8n.

- **Portrait never appears / 401 from receive-n8n-image**  
  If you use **Step 3**, the secret in Netlify and the `X-Webhook-Secret` header in n8n must match exactly. Re-copy the value, remove spaces, save the workflow, and redeploy if you changed the env var.

- **Variables not applied**  
  After changing env vars in Netlify, trigger a new deploy. Variables are applied at deploy time.
