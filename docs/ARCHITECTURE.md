# FluffyFriends — Architecture Map

_Living document. Update with every brief that ships._

This is not exhaustive documentation — it's a **map of feature surfaces** so future briefs can do a 30-second cross-impact check before changing anything. When you ship a brief that touches a surface listed here, update the entry's "Last updated" line and review the "Touches" field for new dependencies.

---

## Architectural principles (read first)

These three rules guide every decision. If a brief contradicts one of these, stop and rethink.

**Rule 1: A portrait's lifecycle is independent of any single purchase.**
The portrait gets created, exists, and persists. Different commercial events (initial credit purchase, optional print upsell via Gelato, additional digital licenses) attach to it independently. Don't write code that assumes "portrait = one purchase row" or "portrait = one transaction." A single portrait may, over time, be: digital-only, then printed, then re-printed in a different size, then shared, then duplicated for a gift recipient.

**Rule 2: Generation and fulfillment are separate concerns.**
WF2 (preview) and WF3 (upscale) produce the asset. Fulfillment (email delivery, print order to Gelato, social share, etc.) is downstream and pluggable. Treat WF3's completion as "asset is upscale-ready" — actual delivery method is dispatched by separate logic. Don't bake fulfillment assumptions into the generation pipeline.

**Rule 3: `/my-portraits` is a commerce surface, not just an archive.**
Every time we touch it, we ask "does this still make sense when Cindy can buy a frame from here?" It is the entry point for: re-downloading, sharing, ordering prints, redeeming remaining credits, and (eventually) re-purchasing. Treat its layout, copy, and CTA hierarchy with that future in mind.

---

## Public-facing routes

### Homepage `/`

- **What:** Brand hero, before/after slider, gallery, how it works, **buyer quotes** (above pricing + inline in pricing), pricing + comparison, about, final CTA (stars line hidden — May 2026), footer
- **Files:** `app/page.tsx`, `components/hero-section.tsx`, `components/home-buyer-quote-section.tsx`, `components/pricing-section.tsx`, `components/final-cta-section.tsx`, other section components
- **Touches:** GA4 pageview, Meta Pixel ViewContent, image optimization (`next.config.mjs`), cache headers (`netlify.toml`)
- **Last updated:** 6 May 2026 (buyer quote blocks, hide final-cta star row)

### `/create`

- **What:** Wizard — theme selection, photo upload, **pre-generation email gate (email vs wait)**, immediate watermarked preview reveal (no second email gate), package selection (or credit redemption for returning customers), checkout
- **Files:** `app/create/page.tsx`, `components/preview-reveal-stage-b.tsx`, `components/image-upload.tsx`
- **Touches:**
  - WF1 (photo validation) via `/api/create-portrait` calling `N8N_WEBHOOK_URL` env var
  - WF2-NEW (preview generation) via `/api/trigger-preview` calling `webhook/generate-preview-v2`
  - **OLD WF3** (upscale + email) for returning customers via `/api/trigger-generation` calling `N8N_ORDER_PAID_WEBHOOK_URL = webhook/order-paid`
  - **NEW WF3** (upscale + email) for new customers via `/api/stripe-webhook-v2` calling `webhook/upscale-and-deliver-v2`
  - `/api/validate-voucher` (voucher state machine)
  - `/api/save-preview-email` — optional email on Gate 1 and soft capture under pricing on `PreviewRevealStageB`
  - `pet_portraits` schema, `portrait_purchases` schema
  - GTM funnel events
  - URL deep-link convention (`?theme=`, `?name=`, `?email=`, `?promo=`)
- **Last updated:** 6 May 2026 (single reveal + lighter watermark + soft email under pricing)

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
- **Touches:** WF3-NEW (upscale completion writes URLs), `pet_portraits.landscape_url`, **`pet_portraits.image_url`** (poll treats upscale-ready as URL mismatch vs placeholder AVIF — Brief 28), `pet_portraits.showcase_consent`. NOTE: declares `downloadLinks` state but never populates it — download buttons in this file are dead code. Real downloads happen on `/my-portraits` after redirect.
- **Last updated:** 30 Apr 2026 (Brief 28 — completion gate now requires landscape_url ≠ image_url, 30s minimum loader, fixes AVIF download race condition)

### `/my-portraits`

- **What:** Returning-customer entry to access already-paid portraits and remaining credits. Single source of truth for download buttons. Will eventually become the print upsell entry point (Gelato).
- **Files:** `app/my-portraits/page.tsx`, `app/my-portraits/layout.tsx`
- **Touches:** `pet_portraits.landscape_url`/`portrait_url`, `portrait_purchases.portraits_remaining`, **`getDownloadUrl()` in `lib/cloudinary.ts`** (forces JPG for downloads), **receives only fully-upscaled portraits via `/checkout/success` gate (Brief 28)**
- **Last updated:** 29 Apr 2026 (Brief 21+22 — JPG-forced download URLs, q_100 quality)
- **Known styling drift — refresh planned.**
- **Future commerce surface for Gelato print orders — design with that in mind.**

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

- **What:** Re-engaging preview-stage portraits without payment. **Target cadence (app + n8n alignment May 2026):** (1) when preview is ready — immediate; (2) **2 hours** later — “still here” nudge; (3) **24 hours** later — final reminder. **Removed:** third wave at ~48h. Implement timing in n8n + `get_recovery_email_candidates()` — see `docs/N8N_RECOVERY_EMAIL_CADENCE.md`.
- **Files:** n8n workflow `59jKJ6Ot1kkaw5Zf`, `get_recovery_email_candidates()` Postgres function, `/preview/[id]/page.tsx`, `/unsubscribe/[token]/page.tsx`
- **Touches:** `pet_portraits.preview_token`, `pet_portraits.preview_expires_at`, `pet_portraits.recovery_email_*_sent_at`, `pet_portraits.recovery_emails_paused`, watermark via `applyWatermark` in `lib/cloudinary.ts`, SMTP credential `FF - Mail - Stephan`
- **Last updated:** 6 May 2026 (cadence brief; n8n execution pending)

### Preview-first portrait flow (production)

- **What:** Watermarked portrait generated BEFORE payment; upscaled JPG (5504×3072, ~4MB) delivered AFTER
- **Active workflows:**
  - **WF1** `VReUuMzIX3daxZrjcizPi` — photo validation, called by `/api/create-portrait` via `N8N_WEBHOOK_URL`
  - **WF2-NEW** `Nzu3e4R3yYZUSyQe` — preview generation, called by `/api/trigger-preview` via `webhook/generate-preview-v2`
  - **NEW WF3** `3QeqDFx4jJlyfWfl` — upscale + email, called by `/api/stripe-webhook-v2` for new customers via `webhook/upscale-and-deliver-v2`
  - **OLD WF3** `AAbWotWCFtInaWGT8ESSA` — upscale + email, called by `/api/trigger-generation` for returning customers via `webhook/order-paid`
- **Touches:** `pet_portraits.image_url` / `portrait_url` / `landscape_url`, Cloudinary uploads (preview goes to `Fluffyfriends/` folder; upscaled JPGs land in root — see Known Issues)
- **Last updated:** 15 Apr 2026 (live); architecture mapped 29 Apr 2026

### Daily intelligence pipeline

- **What:** n8n workflow pulls Windsor.ai data daily, writes to `ff_analytics_daily`, emails branded HTML digest at 07:00 UAE
- **Files:** n8n workflow, `ff_analytics_daily` table
- **Touches:** Windsor.ai connectors, GA4/Meta/IG/Pinterest read-only
- **Last updated:** Apr 2026

---

## Shared libraries / contracts

### `lib/cloudinary.ts`

- **Exports:**
  - `applyWatermark(url)` — three light diagonal text overlays (same low opacity, not tiled) on preview delivery URLs
  - `getDownloadUrl(url)` — forces JPG + attachment disposition + q_100 quality for prints
- **Used by:** recovery email workflow (watermark), `/create` + `/preview/[id]` preview surfaces, `/my-portraits` (downloads). Available to any future surface that needs Cloudinary transforms.
- **Last updated:** 6 May 2026 (lighter preview watermark)

### `/api/validate-voucher`

- **What:** Validates Stripe promotion codes, returns `{ valid, promotionCodeId, discountText, code, percent_off, amount_off }`
- **Used by:** `/create` page voucher state machine (manual entry; URL `?promo=` auto-apply is parked — see Known Issues)
- **Future:** scope will need to expand for print-order vouchers vs credit-purchase vouchers when Gelato launches.
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

### `components/seasonal-campaign-section.tsx`

- **What:** Homepage seasonal campaign card (reusable for Mother’s Day, Father’s Day, etc.).
- **Used by:** `app/page.tsx` (`<SeasonalCampaignSection />` renders nothing while `ACTIVE` is `null`).
- **Activation:** set `ACTIVE` to a populated `SeasonalCampaign` object; `null` hides the entire block from the homepage.
- **Father’s Day / future promos:** re-enable here with new eyebrow/headline/body/image/cta; add or reuse a themed landing route (pattern: `/mothers-day`). The `/mothers-day` page stays in the codebase for evergreen links regardless of homepage visibility.
- **Last updated:** 6 May 2026 — homepage promo off after Mother’s Day; section dormant until next campaign.

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
- **Future tension:** when Gelato comes online, this table represents only credit purchases. Print orders need either a separate `print_orders` table OR a unified `orders` table that both reference. Decision to be made when Gelato is in scope, not before.

---

## Admin

### `/petmaster/*`

- See `fluffyfriends-petmaster.md` in project docs for full breakdown
- Uses service-role Supabase key via `getSupabaseAdmin()` from `lib/supabase-admin.ts`
- Cookie-protected via `middleware.ts` and `PETMASTER_PASSWORD` env var
- **`/petmaster/agents/brain`:** Operator notes (`pb_operator_notes`) and agent decision log (`pb_decision_log`) via **`/api/petmaster-brain-note`** (GET/POST/DELETE) and **`/api/petmaster-brain-decision`** (GET/POST/PATCH). Soft-delete notes (`active`), filter expired in API; decisions split Active (last 90 days + pinned) vs Archive in the UI.

---

## Future architecture (design constraints, not implementation)

### Gelato print integration

- **Status:** Not yet integrated. Document early so today's choices don't paint us in.
- **Where it lands:** Most likely a new flow path triggered from `/my-portraits` ("Order a print of this portrait"). Per-portrait decision, not per-pack — Cindy may print one of her four portraits and leave the rest digital.
- **What it adds:**
  - Frame selection step (size, material, mounting)
  - Shipping address capture
  - Print-side payment (separate from credit purchase)
  - Order to Gelato API
  - Gelato webhook listener for fulfillment status
  - Email touchpoints around shipping + delivery
  - Possible retry/refund flow for print quality issues
- **What it likely requires:**
  - New `print_orders` table linked to `pet_portraits.id`
  - New API routes: `/api/create-print-order`, `/api/gelato-webhook`
  - New voucher scope (print-only codes)
  - Possible WF5 workflow for Gelato dispatch + status tracking
  - True bit-perfect source files (Gelato may reject Cloudinary-transformed JPGs at q_100 — see Known Issues on download architecture)
- **Architectural impact on today's code:** Reinforces Rules 1, 2, 3 above. Don't bake "portrait = single purchase" assumptions into anything we ship now.

### Returning-customer flow alignment (Option B — planned for 30 Apr 2026)

- **Status:** Tomorrow's brief. Documented here so the design is settled before code starts.
- **Current behaviour:** Returning customer with credits goes: theme → photo → "looking great" confirmation page (with redundant terms checkboxes) → fires WF2+WF3 in sequence via `trigger-generation` → redirected to `/my-portraits` for download.
- **Target behaviour:** Returning customer goes: theme → photo → un-watermarked preview reveal → approve → upscale → `/my-portraits` for download. Same emotional shape as new-customer flow, minus payment.
- **What changes:**
  - Removes age + terms checkboxes from returning-customer block (they accepted at original purchase; WF4 dispute flow with auto-credit-return mitigates "wrong portrait" risk)
  - Splits the current single `trigger-generation` call into two: (a) generate preview, (b) upon approval, upscale and deliver
  - Returning-customer page needs preview state machine matching new-customer page
  - May need a new API route or repurpose `trigger-generation` for the upscale-only step
  - n8n: WF3 needs to be triggerable independently of WF2 (likely already is via separate webhook — needs verification)
- **Design constraint from Gelato:** the un-watermarked preview reveal is also where the future "buy a print" CTA might first appear. Don't optimise the layout in a way that wouldn't accommodate that CTA later.

---

## Known issues / drift

- **Returning-customer `/my-portraits` download race (AVIF placeholder before upscale finished): resolved Brief 28** — `/checkout/success` gates redirect on `landscape_url !== image_url` plus a 30s minimum loader before sending customers to downloads.

- **`?promo=FORMUM20` auto-apply on `/create` is broken.** Effect doesn't fire (no `/api/validate-voucher` network call on page load). Diagnosed but not fixed. Workaround: discount badge visible on `/mothers-day`, Cindy types code manually. Revisit post-Mother's-Day.

- **`/my-portraits` styling drift** vs. the rest of the site. Returning-customer entry point is functional but visually disconnected from `/create`. Refresh planned. Critical because this becomes the Gelato commerce entry point.

- **Cloudinary upscaled JPGs land in root, not `Fluffyfriends/` folder.** WF3 upload nodes (both OLD and NEW) missing `asset_folder` parameter. Preview uploads (WF2-NEW) land correctly. Asset hygiene only — doesn't affect customer experience. To be fixed via n8n directly.

- **OLD WF2 (`J4r8aoduC5kUi-iKCrKu0`) still active in n8n.** Currently unclear whether anything in production calls it. Needs further investigation before archive. Phase-2 cleanup.

- **OLD WF3 (`AAbWotWCFtInaWGT8ESSA`) is LOAD-BEARING for returning customers.** Cannot archive without first migrating `/api/trigger-generation` to call NEW WF3's webhook. Migration requires verifying NEW WF3's input schema matches what `trigger-generation` sends. Phase-2 cleanup.

- **WF3 uses hardcoded crop coordinates** (`c_crop,w_2172,h_3072,x_1666,y_0`) for the portrait variant URL. Math is valid given Imagen always outputs 5504×3072, but the crop is a fixed slice from the right side, not subject-aware. Some pets may end up off-center in the portrait crop. Phase-2 concern — not a campaign blocker.

- **WF3 delivery email** sends raw Cloudinary URLs in download links — same AVIF auto-conversion + recompression issue that `/my-portraits` had pre-Brief-21+22. To be fixed via n8n by injecting `fl_attachment,f_jpg,q_100/` into the URLs in the Build Payload Code node.

- **Cloudinary `q_100` is a workaround.** Delivers ~95% of source bytes (3.5MB from a 3.8MB source) — print-acceptable but not bit-perfect. True bit-perfect downloads would require uploading to Cloudinary as `resource_type: raw` or moving storage to Supabase Storage. Will become more relevant when Gelato API is in scope (their print queue may be stricter than self-service print shops). Phase-2 architectural cleanup.

- **Mid-pipeline AVIF placeholder window:** between WF3 start and upscale completion, `pet_portraits.landscape_url` and `portrait_url` temporarily contain the AVIF preview URL (often equal to `image_url`). `/checkout/success` gates redirect on this distinction (`landscape_url !== image_url`). Other surfaces that read these columns directly (admin tools, future analytics) should apply the same check or expect AVIF placeholders during this window.

- **Returning-customer flow has redundant consent step** (age + terms checkboxes on the "looking great" page). They accepted at original purchase. To be removed as part of the returning-customer flow alignment (Option B) work scheduled for 30 Apr 2026.

---

## Convention for future briefs

Before writing any brief:

1. Identify the feature surface(s) the brief will touch
2. Search this document for those surface names
3. Check the "Touches" field for each — does the brief change any contract those touches rely on?
4. Re-read the three Architectural Principles at the top. Does this brief contradict any of them?
5. If yes to #3 or contradicts #4, the brief must address dependent surfaces OR explicitly note them as out-of-scope and flag for follow-up
6. After the brief ships, update affected entries' "Last updated" lines

Keep this document **flat and scannable**. If it grows past 250 lines, split by domain only when length actually impedes use.
