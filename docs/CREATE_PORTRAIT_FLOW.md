# Create Portrait – Flow and API

## Overview

1. User goes to **/create**, uploads a pet photo and optional pet name, selects a theme.
2. The app uploads the image to Supabase Storage (`images/uploads/`) and fetches the theme prompt from Supabase.
3. The API fetches the theme’s prompt and name-tag config from `theme_prompts` (including `has_name_tag`, `name_tag_instruction`). It replaces `{{PET_NAME}}` in the prompt with the pet name and, for any theme with name tag enabled, appends a NAME PATCH step if the prompt doesn’t already contain `{{PET_NAME}}`.
4. The API POSTs the **resolved prompt** and other data to the n8n webhook, including **`theme_has_nametag`** (boolean) so n8n can branch without hardcoding theme names. If the webhook fails (non-2xx or timeout), the API returns 503.
5. n8n fetches the image, sends the prompt and images to Gemini; Gemini generates the portrait (including any name patch). n8n then POSTs to `/api/receive-n8n-image`.
6. The create page polls `pet_portraits` and shows the result when the new row appears.

## API details

- **Page:** `/create` – form (file input, pet name, theme), submit → POST to API → “Processing…” → poll for result.
- **API:** `POST /api/create-portrait` – `multipart/form-data` with `file` (or `image`), `theme` (required), optional `pet_name`, `showcase_consent`. Theme validated against active themes from Supabase. Uploads to `images/uploads/{timestamp}-{uuid}.{ext}`, then POST to `N8N_WEBHOOK_URL` with: `test_image`, `pet_name`, `name`, `theme`, **`prompt`** (fully resolved), **`theme_has_nametag`** (boolean), `showcase_consent`. Returns 503 if webhook fails.

## Supabase Storage (uploads folder)

The API uses the **anon** key to upload to `images/uploads/`. If uploads fail with RLS or “bucket not found”:

- Run **`supabase/run-allow-uploads-storage.sql`** in the Supabase SQL Editor. It adds policies so anon can **insert** into `images/uploads/` and **public** can **select** (read) so n8n can fetch the image from the URL.

## Name tag (e.g. fireman chest patch)

The **visible name on the image** is rendered by **Gemini** from the prompt (no Cloudinary overlay in current build). Name-tag behaviour is **per theme** and configured in `theme_prompts`:

- **`has_name_tag`** – when true, the API will append a NAME PATCH step if the prompt doesn’t already contain `{{PET_NAME}}`.
- **`name_tag_instruction`** – optional theme-specific instruction (e.g. fireman chest patch); if null, the app uses a default. Must include `{{PET_NAME}}`; the API replaces it with the pet name before sending to n8n.

The webhook payload includes **`theme_has_nametag`** so n8n can branch on that instead of hardcoding theme names. n8n GEMINI node must use `body.prompt`. See **ADDING_A_NEW_THEME.md** for adding themes with name tags, and **N8N_GEMINI_USE_PAYLOAD_PROMPT.md** for the node setup.

## n8n

Webhook receives the payload above; **body.prompt** is the final prompt for Gemini, and **body.theme_has_nametag** indicates whether this theme uses a name tag (use this in IF nodes instead of checking `body.theme === 'fireman'`). HTTP Request fetches the image from `body.test_image`. GEMINI node must use `body.prompt` (see N8N_GEMINI_USE_PAYLOAD_PROMPT.md).

## Testing: use the deployed Netlify site

To test the full flow without confusion, **use your live site** (e.g. `https://fluffyfriends.online`):

1. **Create a portrait:** open `https://your-site.netlify.app/create`, upload a photo, submit. The request goes from Netlify → n8n webhook.
2. **Test n8n / quick checks:** open `https://your-site.netlify.app/test-n8n` (Upload and run n8n, or Full flow with URL). Same: trigger runs from Netlify.

No local proxy or extra env vars. Set `N8N_WEBHOOK_URL` in Netlify (production or test URL), deploy, and test on the deployed URL. If n8n only responds on the test webhook, use the Test URL in Netlify and click **Execute Workflow** in n8n before each submit (see N8N_SETUP.md).
