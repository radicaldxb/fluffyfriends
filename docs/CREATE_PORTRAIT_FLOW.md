# Create Portrait – User flow

## Overview

1. User goes to **/create** and uploads a pet photo (file) + optional pet name.
2. The app uploads the image to Supabase Storage (`images/uploads/`) and triggers the n8n webhook with the public URL.
3. The **n8n flow is unchanged**: webhook receives `test_image` (URL), HTTP Request fetches the image, then the rest of the flow runs (e.g. Gemini, then POST to `/api/receive-n8n-image`).
4. The create page polls `pet_portraits` and shows the result when the new row appears.

## App pieces

- **Page:** `/create` – form (file input, pet name), submit → POST to API → “Processing…” → poll for result.
- **API:** `POST /api/create-portrait` – expects `multipart/formData` with `file` (or `image`) and optional `pet_name`. Uploads to `images/uploads/{timestamp}-{uuid}.{ext}`, then fire-and-forget POST to `N8N_WEBHOOK_URL` with `{ test_image: publicUrl, pet_name, name }`.

## Supabase Storage (uploads folder)

The API uses the **anon** key to upload to `images/uploads/`. If uploads fail with RLS or “bucket not found”:

- Run **`supabase/run-allow-uploads-storage.sql`** in the Supabase SQL Editor. It adds policies so anon can **insert** into `images/uploads/` and **public** can **select** (read) so n8n can fetch the image from the URL.

## n8n

No changes needed. The webhook still receives the same payload shape: `test_image` (URL of the uploaded photo), `pet_name`, `name`. The HTTP Request node that fetches the image from `body.test_image` continues to work.

## Testing: use the deployed Netlify site

To test the full flow without confusion, **use your live site** (e.g. `https://fluffyfriends-dev.netlify.app`):

1. **Create a portrait:** open `https://your-site.netlify.app/create`, upload a photo, submit. The request goes from Netlify → n8n webhook.
2. **Test n8n / quick checks:** open `https://your-site.netlify.app/test-n8n` (Upload and run n8n, or Full flow with URL). Same: trigger runs from Netlify.

No local proxy or extra env vars. Set `N8N_WEBHOOK_URL` in Netlify (production or test URL), deploy, and test on the deployed URL. If n8n only responds on the test webhook, use the Test URL in Netlify and click **Execute Workflow** in n8n before each submit (see N8N_SETUP.md).
