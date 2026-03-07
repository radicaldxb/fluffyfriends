# FluffyFriends — Project Summary

A single-document overview of the project for review and onboarding. Generated for verification that it accurately captures the codebase.

---

## What It Is

**FluffyFriends** is a commercial web app that turns pet photos into AI-generated “fine art” portraits. Users pick a theme (e.g. Fireman, Spaceman), upload a photo and optional pet name, pay via Stripe, and receive a themed portrait (with optional name patch). The stack is **Next.js 16**, **Supabase** (DB + storage), **Stripe**, and **n8n** (workflows + Gemini for image generation). Deployed on **Netlify**.

---

## Design System (“Digital Sketchbook”)

- **Aesthetic:** Warm, personal, hand-drawn feel; cream/paper backgrounds, earthy charcoal text, warm orange accents. No sharp corners or generic tech UI.
- **Colors:** All from `app/globals.css` semantic tokens (`bg-background`, `text-foreground`, `bg-primary`, `border-border`, `bg-card`, etc.). No hardcoded hex in UI.
- **Shapes:** Cards/panels use `rounded-organic`; buttons/small surfaces use `rounded-organic-sm`. No `rounded-full` for new UI.
- **Typography:** Headings use Nunito; body uses Geist. Section padding `py-14 md:py-20`, container `max-w-7xl mx-auto px-4 sm:px-6`.
- **Layout:** Every page has **Navbar** (logo, nav links, “Make My Portrait” CTA) → **main** (`min-h-screen bg-background`) → **Footer**. Between sections use `<SketchDivider />`, not plain `<hr />`.
- **Source of truth:** `.cursor/rules/fluffyfriends-design-system.mdc` and `docs/CURSOR_DESIGN_AND_FLOW.md` so AI and humans don’t reintroduce old styles or wrong flows.

---

## User Flows

### 1. New Customer (Stripe)

1. **Home** (`/`) — Hero, “How it works”, gallery, pricing (Starter $17, Portrait Pack $49, Family Pack $79), reviews, gift, about.
2. **Create** (`/create`) — 3-step wizard: choose theme (Fireman / Spaceman), upload photo + optional pet name, select product and pay. Image is uploaded to Supabase Storage; `POST /api/create-portrait` builds the prompt (including `{{PET_NAME}}` and optional name-tag step from `theme_prompts`), then calls the n8n webhook. A row is created in `pet_portraits`; user is sent to Stripe Checkout.
3. **Stripe** — Hosted Checkout; success redirects to `/checkout/success?session_id=...&portrait=...`.
4. **Checkout success** (3 steps):
   - **Step 2:** “Payment received” + loader only (no preview).
   - **Step 3:** When `GET /api/approve-portrait` returns the portrait (image ready), show preview and a form; the button says **“Email my portraits →”**. On success the user is redirected to **/my-portraits?email=...**.

### 2. Returning Pack Customer (No Stripe)

- **Create** with `?email=...` in the URL: the page fetches **GET /api/portrait-balance?email=...**. If `portraits_remaining > 0`, the success block shows “Use 1 portrait from my pack” (no package grid or Stripe). Email for the CTA and redirect comes from the URL only.
- Clicking “Use 1 portrait from my pack” calls **POST /api/trigger-generation** with `portrait_id` and `email`, then redirects to `/checkout/success?portrait=...&email=...` (no `session_id`).
- **Checkout success** without `session_id`: polls **GET /api/approve-portrait?portrait_id=...** until the portrait has `image_url`, then shows the same Step 3 (preview + form with “Email my portraits →”); on success redirects to **/my-portraits?email=...**. User details can be pre-filled from `users` by email when available.

### 3. My Portraits

- **My Portraits** (`/my-portraits?email=...`) — **GET /api/my-portraits?email=** returns purchases, portraits, `totalRemaining`. Shows “Portrait Pack — X/Y portraits used”, download links (landscape/portrait URLs), “Create another portrait” when remaining > 0, “Create a new portrait” when all used. Uses `getDisplayUrl()` in `lib/utils.ts` for display URLs and “check again” when links aren’t ready yet.

---

## Backend / APIs

- **Create portrait:** `POST /api/create-portrait` — multipart upload to Supabase `images/uploads/`, prompt from `theme_prompts` + `{{PET_NAME}}` + optional name-tag step, POST to **N8N_WEBHOOK_URL** (WF1). n8n + Gemini generate the image; n8n POSTs to **/api/receive-n8n-image** which writes to `pet_portraits` (e.g. `image_url`, status).
- **Stripe:** `POST /api/create-checkout` — creates Stripe Session with `portrait_id`, `product_id`, `theme` in metadata; `POST /api/stripe-webhook` on `checkout.session.completed` loads portrait, builds prompt (same as create-portrait/theme_prompts), calls **N8N_ORDER_PAID_WEBHOOK_URL** (WF2), updates portrait status.
- **Approve:** `GET /api/approve-portrait` — by `session_id` (Stripe) or `portrait_id` (pack flow). Returns 202 until the portrait has `image_url`, then 200 with portrait data. `POST` accepts `session_id` or `portrait_id`, upserts user, calls **N8N_UPSCALE_AND_EMAIL_WEBHOOK_URL** (WF3), then **POST /api/deduct-portrait**; returns `{ ok, portraits_remaining }`.
- **Other:** `/api/portrait-preview` (stream image), `/api/themes` (static fireman/spaceman for now), `/api/portrait-balance?email=`, `/api/env-check`, `/api/trigger-generation` (pack flow), `/api/my-portraits`, `/api/deduct-portrait`.

---

## Data (Supabase)

- **pet_portraits** — Core table (evolved from `posts`): id, created_at, title, image_url, plus theme, pet_name, original_image_url, status, showcase_consent, rejection fields, etc. RLS: anon can insert (after migration 004), select for all.
- **theme_prompts** — theme_name, prompt, has_name_tag, name_tag_instruction, active; used by create-portrait and stripe-webhook to resolve prompt and name-patch behaviour.
- **portrait_purchases** — Balance and portrait history. Created/updated by Stripe webhook (and deduct-portrait). Fields include package, portraits_total, portraits_used, portraits_remaining, email, expires_at. Used by `/api/portrait-balance` and `/api/my-portraits`.
- **users** — Used for approve flow (name, city, country, state) and pre-fill on success page.
- **Storage:** `images/uploads/` for uploads; `images/themes/` for theme reference images.

---

## Products and Themes

- **lib/products.ts:** `starter` ($17, 1), `portrait_pack` ($49, 4), `family_pack` ($79, 8). Used by create page and create-checkout.
- **lib/themes.ts:** `VALID_THEMES = ["fireman", "spaceman"]`; `DEFAULT_NAMETAG_INSTRUCTION` for name patch when theme has name tag but no custom instruction.
- Theme prompts and name-tag behaviour live in DB (`theme_prompts`); n8n uses `body.prompt` and `body.theme_has_nametag` so no theme names are hardcoded in workflows.

---

## Docs and Runbooks

- **README** points to: create portrait flow, deployment/runbook, Netlify CLI, n8n setup, workflow fallback, name-tag troubleshooting, current build.
- **API_AND_PAGES_AUDIT.md** — Audit of API routes and app pages (dead code, duplication, console logs, hardcoded URLs, legacy/dev-only routes).
- **CHANGES_BRIEF_SESSION.md** — Recent session: trigger-generation for pack customers, approve-portrait by `portrait_id`, my-portraits API and download links, portrait-balance `.ilike("email")`, cache headers, success page polling and pre-fill.

---

## Tech Stack Summary

- **Frontend:** Next.js 16 (App Router), React 19, Tailwind 4, Radix UI, react-hook-form, zod.
- **Backend:** Next.js API routes, Supabase (JS client), Stripe SDK.
- **Automation:** n8n (webhooks + Gemini for generation; WF1 create, WF2 order-paid, WF3 upscale-and-email).
- **Deploy:** Netlify (`npm run build` with webpack), env vars for Stripe, Supabase, n8n webhook URLs.

---

## Notable Details

- **Returning pack flow:** When the create page is opened with `?email=...`, it fetches portrait-balance; if `portraits_remaining > 0`, the user sees “Use 1 portrait from my pack” and no checkout. Email is taken from the URL only for the trigger-generation call and redirect.
- **Name on image:** Rendered by Gemini from the prompt (no Cloudinary overlay); `theme_prompts.has_name_tag` and `name_tag_instruction` control it.
- **Duplicate logic:** `getStripeClient` lives in both create-checkout and stripe-webhook; prompt/name-tag logic is shared between create-portrait and stripe-webhook (and trigger-generation).
- **Placeholder pages:** Privacy and Terms say “coming soon”; My Portraits was “wiring up” but now uses the my-portraits API and download links.
- **Design rule:** Keep checkout success Step 2 (loader only) and Step 3 (preview + “Email my portraits →”, then redirect to my-portraits) separate; theme (e.g. fireman) is passed through checkout metadata and used in n8n.

---

Overall, the repo is a documented, design-system–driven product with a clear new-customer and returning-pack flow, Stripe + n8n + Supabase integration, and a consistent “Digital Sketchbook” UI enforced by globals, rules, and docs.
