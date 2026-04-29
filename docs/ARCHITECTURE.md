# FluffyFriends — Architecture Map

_Living document. Update with every brief that ships._

This is not exhaustive documentation — it's a **map of feature surfaces** so future briefs can do a 30-second cross-impact check before changing anything. When you ship a brief that touches a surface listed here, update the entry's "Last updated" line and review the "Touches" field for new dependencies.

---

## Public-facing routes

### Homepage `/`

- **What:** Brand hero, before/after slider, gallery preview, pricing, reviews, footer
- **Files:** `app/page.tsx`, `components/hero-section.tsx`, `components/hero-before-after-slider.tsx`, all section components
- **Touches:** GA4 pageview, Meta Pixel ViewContent, image optimization (`next.config.mjs`), cache headers (`netlify.toml`)
- **Last updated:** 29 Apr 2026 (Brief 12, 13 — perf optimisation)

### `/create`

- **What:** Wizard — theme selection, photo upload, preview gate, preview reveal, package selection, checkout
- **Files:** `app/create/page.tsx`, `components/preview-reveal-stage-b.tsx`, `components/image-upload.tsx`
- **Touches:** WF1 (photo validation), WF2-NEW (preview generation via `/webhook/generate-preview-v2`), `/api/trigger-preview`, `/api/create-checkout-v2`, `/api/validate-voucher`, `pet_portraits` schema, voucher state machine, GTM funnel events, URL deep-link convention (`?theme=`, `?name=`, `?email=`, `?promo=`)
- **Last updated:** 29 Apr 2026 (Brief 18, 19 — `?promo=` auto-apply [PARKED, see Known Issues])

### `/preview/[id]?token=xxx`

- **What:** Token-protected preview reveal for recovery email recipients
- **Files:** `app/preview/[id]/page.tsx`, reuses `components/preview-reveal-stage-b.tsx`
- **Touches:** `pet_portraits.preview_token`, `pet_portraits.preview_expires_at`, recovery email workflow, watermarking via `applyWatermark`
- **Last updated:** 28 Apr 2026 (Brief 10)

### `/unsubscribe/[token]`

- **What:** One-click unsubscribe from recovery emails
- **Files:** `app/unsubscribe/[token]/page.tsx`
- **Touches:** `pet_portraits.recovery_emails_paused`, recovery email workflow filter
- **Last updated:** 28 Apr 2026 (Brief 11)

### `/checkout/success`

- **What:** Post-purchase landing page; polls for upscale completion, then redirects to `/my-portraits`. Captures showcase consent.
- **Files:** `app/checkout/success/page.tsx`
- **Touches:** WF3-NEW (upscale completion writes URLs), `pet_portraits.landscape_url`, `pet_portraits.showcase_consent`. NOTE: declares `downloadLinks` state but never populates it — download buttons in this file are dead code. Real downloads happen on `/my-portraits` after redirect.
- **Last updated:** 29 Apr 2026

### `/my-portraits`

- **What:** Returning-customer entry to access already-paid portraits and remaining credits. Single source of truth for download buttons.
- **Files:** `app/my-portraits/page.tsx`, `app/my-portraits/layout.tsx`
- **Touches:** `pet_portraits.landscape_url`/`portrait_url`, `portrait_purchases.portraits_remaining`, **`getDownloadUrl()` in `lib/cloudinary.ts`** (forces JPG for downloads)
- **Last updated:** 29 Apr 2026 (Brief 21 — JPG-forced download URLs)
- **Known styling drift — refresh planned next**

### `/mothers-day`

- **What:** Mother's Day campaign landing page (pet-matched hero, social-proof gallery, print/frame guide)
- **Files:** `app/mothers-day/page.tsx`, `app/mothers-day/MothersDayPageClient.tsx`
- **Touches:** URL convention (`?pet=cat` / `?pet=dog`), hero image assets in `/public/images/`, Cloudinary URLs of showcase portraits, sitemap
- **Last updated:** 29 Apr 2026 (Brief 18, 19, 20)

### `/memorial`

- **What:** Memorial portraits — currently waitlist only
- **Files:** `app/memorial/page.tsx`, `app/memorial/MemorialPageClient.tsx`
- **Touches:** [TBD when activated — currently passive]
- **Last updated:** Pre-existing; parked until post-Mother's-Day decision

### `/gallery`

- **What:** Public gallery of customer portraits, statically generated
- **Files:** `app/gallery/page.tsx`, `components/gallery-section.tsx`, `components/gallery-image-lightbox.tsx`
- **Touches:** `pet_portraits.showcase_consent`, `pet_portraits.location`, Cloudinary URLs
- **Last updated:** Apr 2026

### `/blog/*`

- **What:** Long-form articles (currently `mothers-day-dog-mum.mdx`)
- **Files:** `app/blog/[slug]/page.tsx`, `content/blog/*.mdx`
- **Touches:** [content-only, no shared state]
- **Last updated:** Apr 2026

---

## Email + automation flows

### Recovery email sequence

- **What:** 3-stage drip (30min / 24h / 47h) re-engaging preview-stage portraits without payment
- **Files:** n8n workflow `59jKJ6Ot1kkaw5Zf`, `get_recovery_email_candidates()` Postgres function, `/preview/[id]/page.tsx`, `/unsubscribe/[token]/page.tsx`
- **Touches:** `pet_portraits.preview_token`, `pet_portraits.preview_expires_at`, `pet_portraits.recovery_email_*_sent_at`, `pet_portraits.recovery_emails_paused`, watermark via `applyWatermark` in `lib/cloudinary.ts`, SMTP credential `FF - Mail - Stephan`
- **Last updated:** 28 Apr 2026 (live)

### Preview-first portrait flow (WF1 / WF2-NEW / WF3-NEW)

- **What:** Watermarked portrait generated BEFORE payment; upscaled JPG (5504×3072, ~4MB) delivered AFTER
- **Active workflows:** WF1 `VReUuMzIX3daxZrjcizPi` (validation), WF2-NEW `Nzu3e4R3yYZUSyQe` (preview), WF3-NEW `3QeqDFx4jJlyfWfl` (upscale + email)
- **Calls from Next.js:** `/api/trigger-preview` → `webhook/generate-preview-v2`; `/api/stripe-webhook-v2` → `webhook/upscale-and-deliver-v2`
- **Touches:** `pet_portraits.image_url` / `portrait_url` / `landscape_url`, Cloudinary uploads (preview goes to `Fluffyfriends/` folder; upscaled JPGs land in root — see Known Issues)
- **Last updated:** 15 Apr 2026 (live)

### Daily intelligence pipeline

- **What:** n8n workflow pulls Windsor.ai data daily, writes to `ff_analytics_daily`, emails branded HTML digest at 07:00 UAE
- **Files:** n8n workflow, `ff_analytics_daily` table
- **Touches:** Windsor.ai connectors, GA4/Meta/IG/Pinterest read-only
- **Last updated:** Apr 2026

---

## Shared libraries / contracts

### `lib/cloudinary.ts`

- **Exports:** `applyWatermark(url)` — adds tiled watermark for preview reveal; `getDownloadUrl(url)` — forces JPG + attachment disposition for prints
- **Used by:** recovery email workflow (watermark), `/my-portraits` (downloads). Available to any future surface that needs Cloudinary transforms.
- **Last updated:** 29 Apr 2026 (Brief 21 — added `getDownloadUrl`)

### `/api/validate-voucher`

- **What:** Validates Stripe promotion codes, returns `{ valid, promotionCodeId, discountText, code, percent_off, amount_off }`
- **Used by:** `/create` page voucher state machine (manual entry; URL `?promo=` auto-apply is parked — see Known Issues)
- **Last updated:** Apr 2026

### URL deep-link convention

- **Pattern:** `/create?theme=X&name=Y&promo=CODE` — every occasion landing page CTA uses this
- **Currently consumed by:** `/create` (theme selects, name pre-fills, jumps to step 2 when both present); promo auto-apply is parked
- **Mother's Day adds:** `?pet=cat` / `?pet=dog` on `/mothers-day`, forwarded to `/create` for future Phase-2 work
- **Last updated:** 29 Apr 2026 (Brief 18, 20)

### Tracking stack

- **GTM** (`GTM-NLSHKZ2F`) — fires Custom Events on `/create` funnel steps
- **GA4** (`G-8KYJG9BH46`) — receives funnel + ecommerce events
- **Meta Pixel** (`1775434052703488`) — ViewContent / InitiateCheckout / Purchase
- **Microsoft Clarity** — heatmaps + session replay (records `/create` funnel)
- **Used by:** all public routes via `app/layout.tsx`
- **Last updated:** 29 Apr 2026

---

## Database surfaces

### `pet_portraits`

- **Key fields used by multiple features:** `id`, `pet_name`, `theme`, `status`, `user_email`, `landscape_url`, `portrait_url`, `image_url`, `preview_token`, `preview_expires_at`, `recovery_email_*_sent_at`, `recovery_emails_paused`, `showcase_consent`, `location`
- **Consumed by:** `/create`, `/preview/[id]`, `/checkout/success`, `/my-portraits`, `/gallery`, `/mothers-day` (gallery cards), recovery email RPC, daily intelligence
- **Anon UPDATE policy:** REQUIRED — Next.js API routes use anon key, not service role

### `portrait_purchases`

- **Key fields:** `email`, `package`, `portraits_total`, `portraits_remaining`, `portraits_used`, `expires_at`
- **Consumed by:** `/my-portraits`, `/api/create-checkout-v2`, recovery email RPC (excludes purchased rows)
- **CHECK constraint:** `package` ∈ `{starter, portrait_pack, family_pack}`

---

## Admin

### `/petmaster/*`

- See `fluffyfriends-petmaster.md` in project docs for full breakdown
- Uses service-role Supabase key via `getSupabaseAdmin()` from `lib/supabase-admin.ts`
- Cookie-protected via `middleware.ts` and `PETMASTER_PASSWORD` env var

---

## Known issues / drift

- **`?promo=FORMUM20` auto-apply on `/create` is broken.** Effect doesn't fire (no `/api/validate-voucher` network call on page load). Diagnosed but not fixed. Workaround: discount badge visible on `/mothers-day`, Cindy types code manually. Revisit post-Mother's-Day.
- **`/my-portraits` styling drift** vs. the rest of the site. Returning-customer entry point is functional but visually disconnected from `/create`. Refresh planned as next brief.
- **Cloudinary upscaled JPGs land in root, not `Fluffyfriends/` folder.** WF3-NEW upload node missing `asset_folder` parameter. Preview uploads (WF2-NEW) land correctly. Asset hygiene only — doesn't affect customer experience. To be fixed via n8n directly.
- **OLD WF2 (`J4r8aoduC5kUi-iKCrKu0`) and OLD WF3 (`AAbWotWCFtInaWGT8ESSA`) still active in n8n.** Not currently called by any production code path (verified via codebase grep — only `/api/create-portrait` references unused `N8N_WEBHOOK_URL` env var; `/api/stripe-webhook` references unused `N8N_ORDER_PAID_WEBHOOK_URL`). Will be deactivated and archived as part of cleanup.
- **WF3-NEW uses hardcoded crop coordinates** (`c_crop,w_2172,h_3072,x_1666,y_0`) for the portrait variant URL. Math is valid given Imagen always outputs 5504×3072, but the crop is a fixed slice from the right side, not subject-aware. Some pets may end up off-center in the portrait crop. Phase-2 concern — not a campaign blocker.
- **WF3 delivery email** sends raw Cloudinary URLs in download links — same AVIF auto-conversion issue as `/my-portraits` had pre-Brief-21. To be fixed via n8n by injecting `fl_attachment,f_jpg,q_auto:best/` into the URLs in the Build Payload Code node.

---

## Convention for future briefs

Before writing any brief:

1. Identify the feature surface(s) the brief will touch
2. Search this document for those surface names
3. Check the "Touches" field for each — does the brief change any contract those touches rely on?
4. If yes, the brief must address dependent surfaces OR explicitly note them as out-of-scope and flag for follow-up
5. After the brief ships, update affected entries' "Last updated" lines

Keep this document **flat and scannable**. If it grows past 200 lines, split by domain only when length actually impedes use.
