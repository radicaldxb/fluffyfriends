# Current build (locked – Feb 2026)

Snapshot of the **stable Fluffyfriends portrait pipeline as of Feb 2026**, after adding Cloudinary AVIF + JPG, original image storage, and deployment/docs hardening.

---

## What this build does

- **Create portrait (`/create`):**
  - User uploads a photo + pet name, selects a theme.
  - App uploads the raw photo to Supabase Storage (`images/uploads/`).
  - App fetches the theme prompt from Supabase `theme_prompts`, replaces `{{PET_NAME}}`, applies name‑tag safety net for themes that need it, and POSTs the resolved **`prompt`** + **upload URL** to `N8N_WEBHOOK_URL`.
  - If the webhook fails (non‑2xx or timeout), the API returns **503** (no fake “queued” state).

- **n8n (Fluffyfriends-16 workflow):**
  - Webhook receives `body.prompt`, `body.test_image`, `body.pet_name`, `body.theme`, `body.theme_has_nametag`, etc.
  - GEMINI node uses `body.prompt` for the text instruction and produces the portrait image.
  - **CONVERTER** node uploads the GEMINI image to **Cloudinary** and returns:
    - `secure_url` = original **.jpg**,
    - `eager[0].secure_url` = optimized **.avif** (`f_avif,q_auto`).
  - Final HTTP Request node (named `Supabase`) POSTs to `/api/receive-n8n-image` with:
    - `image_url` = `eager[0].secure_url` (.avif, display),
    - `original_image_url` = `secure_url` (.jpg, source for upscaling),
    - `pet_name`, `name`, `showcase_consent`, `status`.

- **Backend (`/api/receive-n8n-image`):**
  - If `image_url` is an external URL (Cloudinary), it **does not** re‑upload; it stores the URL directly.
  - Inserts/updates a row in `pet_portraits` with:
    - `image_url` = Cloudinary .avif,
    - `original_image_url` = Cloudinary .jpg,
    - `pet_name`, `status`, `showcase_consent`, etc.
  - Response includes:
    - `image_url`,
    - `original_image_url` (when provided),
    - `original_image_url_stored: true|false`,
    - `path` (always `null` for Cloudinary flow).

- **Data model:**
  - `pet_portraits.image_url` → display URL (Cloudinary .avif).
  - `pet_portraits.original_image_url` → original source image (Cloudinary .jpg) for 4K/upscaler/download flows.

---

## Key files

| Area | File / location |
|------|-----------------|
| Create API | `app/api/create-portrait/route.ts` – upload, prompt fetch, `{{PET_NAME}}` replace, fireman safety net, webhook POST |
| n8n flow | `Fluffyfriends-16.json` – GEMINI + CONVERTER → HTTP Request (`Supabase`) with both `image_url` (.avif) and `original_image_url` (.jpg) |
| Receive callback | `app/api/receive-n8n-image/route.ts` – Cloudinary URL handling, insert/update into `pet_portraits`, `original_image_url_stored` flag |
| Themes | `lib/theme-prompts.ts`, `supabase/run-add-theme-nametag-columns.sql` – active themes + name‑tag flags |
| Types | `types/database.ts` – `PetPortrait` / `PetPortraitInsert` include optional `original_image_url` |

---

## Docs to use next

- **Flow and API:** `docs/CREATE_PORTRAIT_FLOW.md`  
- **Cloudinary AVIF + JPG:** `docs/N8N_CONVERTER_NODE_AVIF_SETUP.md`, `docs/AVIF_AND_JPG_WHERE_THEY_LIVE.md`  
- **n8n JPG not saving (troubleshooting):** `docs/N8N_JPG_NOT_SAVING.md`, `docs/DO_THIS_SAVE_AVIF_AND_JPG.md`  
- **Deploy and runbook:** `docs/DEPLOYMENT_AND_RUNBOOK.md` · **Netlify CLI:** `docs/NETLIFY_CLI_SETUP.md`  
- **Architecture:** `docs/ARCHITECTURE_REVIEW.md`, `docs/IMAGE_STORAGE_ARCHITECTURE.md`  
