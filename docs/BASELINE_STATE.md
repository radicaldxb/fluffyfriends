# Fluffyfriends Baseline - Current Stable State

**Date:** February 20, 2026  
**Status:** ✅ Production-ready baseline

---

## Architecture Overview

### Tech Stack
- **Frontend:** Next.js (App Router), React, TypeScript
- **Hosting:** Netlify
- **Database:** Supabase (PostgreSQL + Storage)
- **Orchestration:** n8n (self-hosted)
- **AI:** Google Gemini API (gemini-3-pro-image-preview)

### Flow
```
User uploads → Next.js API → Supabase Storage → n8n webhook → 
  Fetch images → GEMINI → Callback API → Supabase DB → Client polls
```

---

## Core Features

### ✅ Theme Management (Dynamic)
- **Themes stored in Supabase:** `theme_prompts` table
- **Prompts editable in DB:** No code changes needed
- **Dynamic theme list:** `/api/themes` endpoint
- **UI loads themes:** `/create` page fetches from API
- **Validation:** API validates themes from DB (`getActiveThemes()`)

### ✅ Security
- **Webhook secret:** `N8N_WEBHOOK_SECRET` protects callback endpoint
- **API key:** GEMINI key stored in n8n (not in code)
- **RLS policies:** Supabase tables secured

### ✅ Error Handling
- **503 on n8n failure:** Returns error when webhook fails (no fake "queued")
- **Fallback prompts:** Thin generic prompt if Supabase unavailable
- **Error IDs:** Trackable error IDs in responses

### ✅ Image Processing
- **Theme images:** Stored in Supabase Storage (`images/themes/{theme}-master.png`)
- **User uploads:** Stored in Supabase Storage (`images/uploads/`)
- **Generated portraits:** Stored in Supabase Storage (`images/generated/`)
- **Base64 handling:** n8n extracts and passes images to GEMINI

---

## Database Schema

### Tables

**`pet_portraits`**
- `id` (UUID)
- `created_at` (timestamp)
- `image_url` (text) - Generated portrait URL
- `pet_name` (text)
- `status` (text)
- `user_email` (text, nullable)
- `original_image_url` (text, nullable)

**`theme_prompts`**
- `id` (UUID)
- `theme_name` (text, unique) - e.g., "fireman", "spaceman"
- `prompt` (text) - Full prompt text for GEMINI
- `created_at` (timestamp)
- `updated_at` (timestamp, auto-updated)
- `active` (boolean) - Enable/disable themes

### Storage Buckets

**`images` bucket:**
- `uploads/` - User-uploaded pet photos
- `themes/` - Theme master images (`{theme}-master.png`)
- `generated/` - Generated portraits from n8n

---

## API Endpoints

### `POST /api/create-portrait`
- Uploads image to Supabase Storage
- Validates theme from DB (`getActiveThemes()`)
- Fetches prompt from Supabase (`getPromptForTheme()`)
- Sends to n8n webhook with full payload
- Returns 503 if n8n fails (honest error)

**Payload to n8n:**
```json
{
  "test_image": "https://...",
  "pet_name": "...",
  "name": "...",
  "theme": "fireman",
  "prompt": "INSTRUCTION: Create..."
}
```

### `POST /api/receive-n8n-image`
- Receives generated image from n8n
- Validates `X-Webhook-Secret` header (if `N8N_WEBHOOK_SECRET` set)
- Stores image in Supabase Storage
- Inserts/updates `pet_portraits` table

### `GET /api/themes`
- Returns active themes from `theme_prompts` table
- Format: `{ themes: [{ id, name, previewUrl }] }`
- Used by `/create` page for dynamic theme list

---

## n8n Workflow Structure

**Current workflow:** `docs/n8n-fluffyfriends-working.json`

**Node flow:**
```
Webhook (receives prompt + theme + image URL)
  ├─→ User image (fetch pet photo) → Extract user image → Merge (input 1)
  └─→ Fetch Theme Image (fetch theme master) → Extract theme → Merge (input 0)
       ↓
       Merge → Set (adds prompt from Webhook) → GEMINI → Convert to File → Supabase (callback)
```

**Key nodes:**
- **Webhook:** Receives `{ test_image, pet_name, theme, prompt }`
- **Set (Edit Fields):** Adds `prompt` field from Webhook to data flow
- **GEMINI:** Uses `$json.prompt` for text, `$('Extract theme').item.json.data` and `$('Extract user image').item.json.data` for images
- **Supabase (callback):** Sends `X-Webhook-Secret` header, POSTs to `/api/receive-n8n-image`

---

## Environment Variables (Netlify)

**Required:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `N8N_WEBHOOK_URL`

**Optional but recommended:**
- `N8N_WEBHOOK_SECRET` - For callback security

---

## Key Files

### Core Application
- `app/api/create-portrait/route.ts` - Main upload + webhook trigger
- `app/api/receive-n8n-image/route.ts` - n8n callback handler
- `app/api/themes/route.ts` - Theme list API
- `app/create/page.tsx` - Create page (dynamic themes)
- `lib/theme-prompts.ts` - Prompt fetching from Supabase
- `lib/themes.ts` - Theme utilities

### Database
- `supabase/run-create-theme-prompts-table.sql` - Creates `theme_prompts` table
- `supabase/run-seed-theme-prompts.sql` - Seeds initial prompts

### Configuration
- `docs/n8n-fluffyfriends-working.json` - Current n8n workflow (reference)
- `.env.example` - Environment variable template

---

## Current Limitations / Known Issues

1. **Polling:** Client polls entire `pet_portraits` table (last 15 rows) - could be optimized with job table
2. **No retry:** If n8n fails, request is lost (no retry mechanism)
3. **No job tracking:** No explicit job ID for status lookup
4. **Theme preview images:** Must be manually added to `public/images/themes/` for UI

---

## Adding a New Theme (No Code Changes)

1. **Upload master image:** `images/themes/{theme}-master.png` in Supabase Storage
2. **Insert prompt:** `INSERT INTO theme_prompts (theme_name, prompt, active) VALUES (...)`
3. **Add preview image:** `public/images/themes/{theme}-preview.webp` (optional, for UI)
4. **Deploy:** Only needed if adding preview image (for UI)

**That's it!** Theme appears automatically in API and UI.

---

## Testing Checklist

- [ ] Theme validation works (invalid theme rejected)
- [ ] Prompts fetched from Supabase
- [ ] Webhook receives `prompt` in body
- [ ] Set node passes prompt to GEMINI
- [ ] GEMINI generates images with theme-specific prompts
- [ ] Callback stores images in Supabase
- [ ] Client polls and displays portraits
- [ ] Webhook secret protects callback (if set)

---

## Next Steps (Future Enhancements)

- Job table for better status tracking
- Retry mechanism for failed n8n calls
- Rate limiting on API endpoints
- Theme preview images stored in Supabase (not `public/`)
- Analytics/logging for prompt performance

---

## Version Info

- **n8n workflow:** Version `d69498af-e942-41e8-b8a1-9913f793a03c`
- **Last updated:** February 20, 2026
- **Status:** Production-ready baseline

---

## Feb 24, 2026 Updates (Locked Build)

The current build adds several important refinements on top of the baseline above. Treat this section as the **authoritative “as‑of now” state**.

### Image Generation & Prompts

- **Prompt source of truth:** Still the `theme_prompts` table in Supabase.  
  - Backend uses `getPromptAndNameTagConfig()` (`lib/theme-prompts.ts`) to fetch:
    - `prompt` (long text from DB),
    - `hasNameTag` and `nameTagInstruction` (for themes with name patches, e.g. fireman).
  - `POST /api/create-portrait` replaces any `{{PET_NAME}}` placeholders in the prompt and appends a safe default name‑tag instruction when needed.
- **Spaceman prompt:** Updated in both:
  - `lib/prompts.ts` (for code-based access), and
  - `supabase/run-seed-theme-prompts.sql` (for DB seeding),
  to:
  - Match the **art style of the master spaceman image** (no “photorealistic” wording),
  - Keep background + landscape untouched,
  - Copy the suit and helmet design exactly from the master,
  - Replace only the head with the pet (correct perspective),
  - Enforce full‑body framing (boots to top of helmet) in 16:9.

### n8n Workflow (“Nametag + Converter”)

- **Workflow:** `FluffyFriends-Nametag+Converter` (JSON snapshot: `Fluffyfriends-16.json` in Dropbox).
- **Key structure:**

  ```
  Webhook (receives: test_image, theme, prompt, pet_name, theme_has_nametag, showcase_consent)
    → THEME SELECTOR (Code)
      - Wraps DB prompt with global safety rules and image mapping
      - Sets per-theme temperature (e.g. fireman=0.7, spaceman=0.3)
    → Fetch Theme Image (Supabase themes/{theme}-master.png) → Extract theme (base64)
    → User image (test_image URL) → Extract user image (base64) → Validate Subject (Gemini)
    → If valid:
         Merge → GEMINI (HTTP Request → gemini-3-pro-image-preview)
           - JSON body built as a **single expression**:
             - `text` from THEME SELECTOR (`body.prompt`)
             - Image 1 = theme master (`Extract theme`)
             - Image 2 = pet photo (`Extract user image`)
             - `generationConfig.temperature` from THEME SELECTOR
         → Code (extract base64 image from GEMINI response)
         → CONVERTER (Cloudinary AVIF+JPG upload)
         → Supabase callback (POST /api/receive-n8n-image)
      → If rejected:
         Image reject node → POST /api/receive-n8n-image with `rejected: true`
  ```

- **THEME SELECTOR details:**
  - Reads `body.theme` and `body.prompt` from Webhook.
  - Adds a small, shared **GLOBAL SAFETY RULES** header (single pet, no gore, no text/logos, etc.).
  - Appends the raw DB prompt unchanged underneath.
  - Computes `generationConfig.temperature` using an internal map:
    - `fireman: 0.7`,
    - `spaceman: 0.3`,
    - default fallback `0.6`.
  - Downstream GEMINI node reads both `body.prompt` and `generationConfig.temperature` from this node only.

### Create Page (`/create`) – Preview & Checkout

- After a successful generation (Supabase polling finds the matching `pet_portraits` row), the **create page stays on `/create`** and:
  - Sets `status = "success"` and stores:
    - `resultPortraitId` (row `id`),
    - `resultImageUrl` (row `image_url`),
    - `resultPetName`.
- Success state UI:
  - **Hero block:** “Your portrait is ready” + subline “Purchase to download in 4K and print.”
  - **Preview frame:**
    - Aspect-ratio enforced via `aspect-video` with a minimum height so it is always visible.
    - Implementation uses a plain `<img>` inside a relative container (not `next/image`) so it works cleanly with the streaming preview API.
    - Primary source: `/api/portrait-preview?id={resultPortraitId}` (server streams the actual image bytes).
    - Fallback: if the preview API fails, falls back to `resultImageUrl` (the stored image URL).
    - Right‑click and drag disabled to deter casual “Save as”.
    - Watermark overlay centered on top: **“PREVIEW — Unlock 4K”** (semi‑transparent).
  - **CTAs:**
    - Primary: `Get my 4K download — $29` → `/checkout?portrait={resultPortraitId}`.
    - Secondary: `Create another` (resets wizard).
    - Tertiary: `View in gallery` (non‑primary escape).
- `/api/portrait-preview`:
  - Streams image bytes from Supabase Storage by `pet_portraits.id`.
  - Only serves portraits created within `PREVIEW_MAX_AGE_HOURS` (currently 24h).
  - Hides the raw storage URL from the client (preview served from app domain).

These changes are **now the locked baseline** for future work (free‑run limits, email capture, and improved checkout). Any new features should assume:

- Prompts and theme config are in Supabase (`theme_prompts`).
- n8n’s THEME SELECTOR owns per‑theme temperature and global safety wrappers.
- `/create` always shows a watermarked preview and routes to `/checkout` instead of dropping users into the gallery by default.

---

## Feb 25, 2026 Updates (Stripe + Order Paid + Validator)

These updates sit on top of the Feb 24 baseline and are now the **current production behaviour**.

### Input validation (single pet only)

- **Validator node:** `Validate Subject` in the `FluffyFriends-Nametag+Converter` workflow now calls Gemini (flash) with:
  - User image as inline base64 (`Extract user image`).
  - A strict prompt that forces a **single token output**: `VALID_YES` or `VALID_NO` only.
  - `generationConfig`: low temperature and tiny maxOutputTokens.
- **Decision node:** `If` checks:
  - Left: `($json.candidates?.[0]?.content?.parts?.[0]?.text ?? '').trim().toUpperCase()`
  - Operator: string **equal**
  - Right: `VALID_NO`
- **Branching:**
  - **True (VALID_NO):** goes to `Image reject` → `/api/receive-n8n-image` with `rejected: true` and a clear reason.
  - **False (VALID_YES):** continues to `Merge` → `GEMINI` for generation.
- Result: human faces, multiple pets, objects, and non‑pet images are reliably rejected; clean single‑pet photos go through.

### Stripe checkout integration

- **Checkout page:** `app/checkout/page.tsx`
  - Query param `portrait` (id from `/create` success CTA) is required.
  - Shows portrait preview via `/api/portrait-preview?id={portraitId}`.
  - Form collects:
    - `email` (required),
    - `first_name` (required),
    - Product choice (`single_4k` vs `pack_4_4k` from `lib/products.ts`).
  - On submit, posts to `POST /api/create-checkout`.
- **Create checkout API:** `app/api/create-checkout/route.ts`
  - Validates `email`, `first_name`, `product_id` (must be `single_4k` or `pack_4_4k`), and `portrait_id`.
  - Looks up product in `lib/products.ts` to get `priceCents` and `perPortrait`.
  - Writes to Supabase:
    - Inserts an `orders` row with `email`, `name`, `amount_cents`, `status = 'pending'`, `payment_provider = 'stripe'`.
    - Inserts an `order_items` row with `product_id`, `price_cents`, `portrait_ids: [portrait_id]`, `credits_remaining` (3 for 4‑pack, 0 for single).
  - Creates a Stripe Checkout Session with:
    - `mode: "payment"`,
    - `line_items` priced from `priceCents`,
    - `metadata`: `{ order_id, portrait_id, product_id, first_name }`,
    - `success_url`: `${NEXT_PUBLIC_SITE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    - `cancel_url`: `${NEXT_PUBLIC_SITE_URL}/checkout?portrait={portrait_id}`.
  - Returns `{ url, order_id }`; frontend redirects to `url`.
- **Success page:** `app/checkout/success/page.tsx`
  - Client component that reads `session_id` from `searchParams`.
  - Confirms payment and offers **Create another** + **Back to home** CTAs; actual download / portrait listing is deferred to `/my-portraits`.

### Stripe webhook + order-paid bridge to n8n

- **Webhook handler:** `app/api/stripe-webhook/route.ts`
  - Reads `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` from env and returns structured 500 errors if missing.
  - Uses `request.headers.get("stripe-signature")` and `stripe.webhooks.constructEvent` to verify the event.
  - On `checkout.session.completed`:
    - Extracts `order_id`, `portrait_id`, `product_id`, `first_name` from `session.metadata`.
    - Updates the matching `orders` row in Supabase:
      - `status = 'paid'`,
      - `payment_provider = 'stripe'`,
      - `payment_id = session.id`.
    - Loads the `orders` row (`email`, `name`, `amount_cents`) and the first `order_items` row (`product_id`, `price_cents`, `credits_remaining`, `portrait_ids`).
    - Fetches basic `pet_portraits` metadata for those `portrait_ids` (id, pet_name, theme).
    - Builds a flat **order‑paid payload**:
      - `event: "order.paid"`,
      - `order_id`, `product_id`, `currency`, `total_cents`,
      - `credits_remaining`,
      - `user_email`, `user_first_name`,
      - placeholder `user_country`, `user_state`, `user_city` (`null` for now),
      - `portraits: [{ id, pet_name, theme }, …]`.
    - POSTs this JSON to `N8N_ORDER_PAID_WEBHOOK_URL` (env) when configured.
  - Always responds to Stripe with JSON `{ received: true }` (or a structured `{ error, details }` on failure) so the Stripe dashboard clearly reflects webhook status.

### n8n "Order Paid – Deliver" workflow

- New workflow triggered by `https://n8n.srv943460.hstgr.cloud/webhook/order-paid`:
  1. **Webhook** (`Order Paid`):
     - Receives the flat payload above directly under `$json`.
  2. **Code** (`Normalize Data`):
     - Handles both shapes (`$json` vs `$json.body`) to be robust.
     - Computes:
       - `orderId`, `productId`, `totalCents`, `amountDisplay`,
       - `creditsRemaining`,
       - `email`, `firstName`, `country`, `state`, `city`,
       - `portraits` array,
       - simple HTML `portraitsHtml` list,
       - `orderUrl = https://fluffyfriends.online/my-portraits?order={orderId}`.
  3. **Email** (`Send order email`):
     - **To:** `{{$json.email}}`.
     - Subject/body use `firstName`, `amountDisplay`, `portraitsHtml`, and `orderUrl`.
- This workflow is intentionally minimal: it sends a confirmation email with a link to a basic `/my-portraits` page; upscaling, richer download links, and multi‑portrait UX will be layered on later.

### My Portraits page (placeholder)

- **Route:** `app/my-portraits/page.tsx`.
- Reads `order` from `searchParams` and displays:
  - Heading “Your portraits”.
  - A short explanation that this page will show all portraits linked to the order once the experience is complete.
  - The raw order reference id in monospace when provided.
- No actual portrait listing yet; this is a safe landing page for the email’s `orderUrl` while the rest of the UX is being built.

