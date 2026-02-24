# Deployment and Runbook

Stable build as of Feb 2025: create-portrait flow with Supabase theme prompts, `{{PET_NAME}}` replacement, fireman safety net, and n8n using `body.prompt` for Gemini.

---

## Git and Netlify

Netlify builds from your connected Git repository. **Code that is not committed and pushed is not deployed.**

Before deploying (manual or automatic):

1. Commit all changes: `git add -A && git commit -m "Your message"`
2. Push to the branch Netlify uses: `git push origin <branch>` (e.g. `dev` or `main`)

If you deploy manually from the Netlify UI, it still uses the **latest commit on the linked branch** from the remote. So push first, then trigger deploy.

---

## Environment variables (Netlify)

Required for create-portrait and full flow:

| Variable | Purpose |
|----------|---------|
| `N8N_WEBHOOK_URL` | n8n webhook URL; API POSTs the portrait job here. |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL (storage + theme_prompts). |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key (storage upload, DB read). |

Optional:

| Variable | Purpose |
|----------|---------|
| `N8N_WEBHOOK_SECRET` | Shared secret for `/api/receive-n8n-image`; if set, n8n must send it (e.g. `X-Webhook-Secret`). |

See **docs/NETLIFY_ENV_VARS_SETUP.md** and **docs/N8N_WEBHOOK_SECRET_SETUP.md** for setup.

---

## Deploying

- **Automatic:** Push to the connected branch; Netlify runs the build and deploys.
- **Manual (Netlify UI):** Site → Deploys → “Trigger deploy” → “Deploy site” (uses latest commit on that branch).
- **CLI:** From the project root, run `npm run deploy` or `npx netlify deploy --prod --build` (requires `netlify link` and auth). See **NETLIFY_CLI_SETUP.md** for login, link, and troubleshooting.

Build command is per **netlify.toml** (`npm run build`, which uses webpack); output is published as the site.

### Verify .avif and .jpg in production

After deploy, create a portrait on the live site and confirm both URLs are stored:

1. Open **https://your-site.netlify.app/create**, upload a photo, submit.
2. When the portrait appears, the app uses **image_url** (the .avif) for display. To confirm the **original (.jpg)** is stored:
   - **Option A:** In Supabase → Table Editor → `pet_portraits`, open the new row and check that **original_image_url** is filled (Cloudinary or Supabase URL).
   - **Option B:** If you have access to the n8n run that called receive-n8n-image, the response body includes **original_image_url_stored: true** when the .jpg was received and saved.

If **original_image_url** is empty, the n8n node that POSTs to receive-n8n-image is not sending **original_image_url** in the body. Set it to `{{ $('CONVERTER').item.json.secure_url }}` (see **N8N_CONVERTER_NODE_AVIF_SETUP.md**).

---

## Troubleshooting

### Name on image shows literal `{{PET_NAME}}`

- **Cause:** The prompt sent to n8n still contained the placeholder. The app is supposed to replace it before sending.
- **Checks:**
  1. **Git:** Ensure the latest `app/api/create-portrait/route.ts` (with placeholder replacement and fireman safety net) is committed and **pushed** to the branch Netlify uses.
  2. **Deploy:** Trigger a new deploy after the push so Netlify builds from the latest commit.
  3. **n8n:** In the Webhook node output, confirm `body.prompt` contains the real pet name and no `{{PET_NAME}}`. If it does, the fix is deployed; if not, deploy or Git sync is still wrong.

### Portrait “queued” but never appears

- n8n may have returned an error or timed out. The API now returns **503** when the webhook fails (non-2xx or timeout), so the user should see an error message instead of “queued.”
- If the user still sees “queued” and no portrait: check n8n workflow runs and that the callback to `/api/receive-n8n-image` succeeds (and that `N8N_WEBHOOK_SECRET` is set in both Netlify and n8n if you use it).

### Upload or “Server configuration error”

- Missing Supabase env vars: ensure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set in Netlify and that Storage allows anon uploads to `images/uploads/` (see CREATE_PORTRAIT_FLOW.md).

### Theme not found / invalid theme

- Theme is validated against **active** rows in `theme_prompts`. Add or activate the theme in Supabase; no code change needed for new themes (API uses `getActiveThemes()`).

---

## Key files (for this build)

- **app/api/create-portrait/route.ts** – Upload, prompt fetch, `{{PET_NAME}}` replace, fireman safety net, webhook POST.
- **lib/theme-prompts.ts** – `getPromptForTheme()`, `getActiveThemes()` (Supabase).
- **n8n:** GEMINI node must use `$('Webhook').item.json.body.prompt` (see N8N_GEMINI_USE_PAYLOAD_PROMPT.md).
