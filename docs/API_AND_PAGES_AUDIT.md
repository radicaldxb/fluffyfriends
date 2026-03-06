## API and App Pages Audit

This document summarizes a quick audit of all files in `app/api/` and all top-level pages/layouts in `app/` (excluding components).

For each file, we list:
- Dead code or unused variables
- Duplicate logic
- TODOs / placeholder text
- `console.*` statements
- Hardcoded URLs or values that might belong in env/config

---

## API routes (`app/api/*`)

### `app/api/create-portrait/route.ts`

- **Dead / unused**
  - None obvious; all imports, constants, and helpers are used.
- **Duplicate logic**
  - Prompt + `{{PET_NAME}}` replacement logic is conceptually similar to logic in `app/api/stripe-webhook/route.ts` (both use `getPromptAndNameTagConfig` and may append a name-tag instruction).
- **TODO / placeholder**
  - No explicit `TODO` comments; comments are descriptive only.
- **Console logging**
  - Multiple `console.error` calls for:
    - Missing Supabase env vars.
    - Supabase upload exceptions / errors.
    - Public URL fetch failures.
    - WF1 webhook error / exception.
  - One `console.warn` if the prompt still contains `{{PET_NAME}}` after replacement.
- **Hardcoded URLs / values**
  - Hint string includes `http://localhost:3000/api/env-check` for local debugging.
  - Storage constants are hardcoded:
    - `BUCKET = "images"`, `UPLOAD_PREFIX = "uploads"`, `MAX_SIZE_MB = 10`, fixed allowed mime types.

---

### `app/api/receive-n8n-image/route.ts`

- **Dead / unused**
  - None clear; `BUCKET`, RLS-related branches, and all branches are used.
- **Duplicate logic**
  - Contains its own image downloading + storage upload path (base64 / URL / binary), unique to this route.
- **TODO / placeholder**
  - None.
- **Console logging**
  - `console.log("[receive-n8n-image] portrait_id payload", …)` for WF2 payload debugging.
  - Several `console.error` calls for portrait update errors, rejection insert errors, and generic update/insert errors.
- **Hardcoded URLs / values**
  - `BUCKET = "images"` is hardcoded.

---

### `app/api/approve-portrait/route.ts`

- **Dead / unused**
  - All imports and helpers are used; no obvious dead code.
- **Duplicate logic**
  - Uses `resolveSessionContext` pattern; no major duplication with other routes beyond common Supabase usage.
- **TODO / placeholder**
  - None.
- **Console logging**
  - `console.log`:
    - `[approve-portrait][GET] request …`
    - `[approve-portrait][GET] resolved …`
  - `console.warn`:
    - Logs `[approve-portrait][GET] Portrait not ready yet` when `image_url` is missing.
  - `console.error` for:
    - GET exceptions (`[approve-portrait][GET] Error`).
    - POST user upsert failures.
    - POST portrait `user_id` attach failures.
    - WF3 call failures and polling timeouts.
    - Catch-all POST errors.
- **Hardcoded URLs / values**
  - WF3 webhook URL default:
    ```ts
    const upscalerUrl =
      process.env.N8N_UPSCALE_AND_EMAIL_WEBHOOK_URL?.trim() ||
      "https://n8n.srv943460.hstgr.cloud/webhook/upscale-and-email"
    ```
    That literal URL is a fallback and could be env-only.

---

### `app/api/create-checkout/route.ts`

- **Dead / unused**
  - All imports and helper functions are used.
- **Duplicate logic**
  - `getStripeClient` helper is duplicated with `app/api/stripe-webhook/route.ts`.
- **TODO / placeholder**
  - None.
- **Console logging**
  - `console.error` for:
    - Missing `STRIPE_SECRET_KEY`.
    - Missing `NEXT_PUBLIC_SITE_URL` / `SITE_URL`.
    - Session missing URL.
    - Unexpected errors in the catch block.
- **Hardcoded URLs / values**
  - Currency is hardcoded as `"usd"` in line item price data.

---

### `app/api/portrait-preview/route.ts`

- **Dead / unused**
  - `PREVIEW_MAX_AGE_HOURS = 24` is used in a time window check; no dead code.
- **Duplicate logic**
  - Re-fetches `image_url` from Supabase and streams it; unique to this route.
- **TODO / placeholder**
  - None.
- **Console logging**
  - `console.error("[portrait-preview]", err)` on failures.
- **Hardcoded URLs / values**
  - `PREVIEW_MAX_AGE_HOURS = 24` is a fixed config value.

---

### `app/api/themes/route.ts`

- **Dead / unused**
  - The route is active but intentionally temporary.
- **Duplicate logic**
  - Themes defined here must match DB content (theme prompts), so configuration is duplicated in code and DB.
- **TODO / placeholder**
  - JSDoc explicitly states:
    - “Temporary implementation: always return the two static themes…”
    - “while we wire up dynamic themes”.
  - This is effectively a TODO to move to DB-driven themes.
- **Console logging**
  - None.
- **Hardcoded URLs / values**
  - Theme definitions:
    - IDs: `fireman`, `spaceman`.
    - Preview URLs: `/images/themes/fireman-preview.webp`, `/images/themes/spaceman-preview.webp`.

---

### `app/api/orders/route.ts` (legacy test flow)

- **Dead / unused**
  - Implements a **non‑Stripe** “test flow” for orders. Given the current Stripe-only flow, this route is likely unused in production and effectively legacy.
- **Duplicate logic**
  - `VALID_IDS` (`"single_4k"`, `"pack_4_4k"`) diverge from the product IDs used by `create-checkout`.
  - Credit/amount calculation logic overlaps conceptually with the live flow.
- **TODO / placeholder**
  - JSDoc describes it as “Create an order (test flow — no Stripe yet)”.
- **Console logging**
  - `console.error("[orders] Insert error:", orderError)`.
  - `console.error("[orders] Order item insert error:", itemError)`.
  - `[orders]` in the generic catch block.
- **Hardcoded URLs / values**
  - Product IDs are hardcoded and inconsistent with the main product catalog.

---

### `app/api/env-check/route.ts`

- **Dead / unused**
  - Active debugging endpoint; not obviously dead.
- **Duplicate logic**
  - Env checks (`N8N_WEBHOOK_URL`, `N8N_ORDER_PAID_WEBHOOK_URL`, Supabase URL/key) mirror what other routes assume but are centralized here.
- **TODO / placeholder**
  - None.
- **Console logging**
  - None.
- **Hardcoded URLs / values**
  - The `hint` string tells you to use `.env.local` and `npm run dev`, but no URLs.

---

### `app/api/stripe-webhook/route.ts`

- **Dead / unused**
  - All code used in the `checkout.session.completed` path; no obvious dead sections.
- **Duplicate logic**
  - `getStripeClient` helper is duplicated with `create-checkout`.
  - Prompt/name-tag logic parallels the behavior in `create-portrait` (both consult `getPromptAndNameTagConfig` and `DEFAULT_NAMETAG_INSTRUCTION`).
- **TODO / placeholder**
  - None.
- **Console logging**
  - Extensive `console.error` and `console.log`:
    - Config errors (missing Stripe keys/secrets).
    - Signature verification failures.
    - Missing `portrait_id` or missing `theme`.
    - Prompt build failures.
    - WF2 call details:
      - `"[stripe-webhook] Calling WF2" …`
      - `"[stripe-webhook] WF2 call ok" …`
      - `"[stripe-webhook] WF2 responded with non-200" …`
    - Status update failures.
- **Hardcoded URLs / values**
  - WF2 URL read from env (`N8N_ORDER_PAID_WEBHOOK_URL` / `N8N_ORDER_PAID_URL`) only; no inline literal URL.

---

### `app/api/test-webhook/route.ts` (diagnostic)

- **Dead / unused**
  - Dev-only endpoint, likely not exposed in production nav.
- **Duplicate logic**
  - Conceptually overlaps with `/api/test-n8n` in that both ping an n8n URL, but this one is specialized for connectivity and response-time reporting.
- **TODO / placeholder**
  - None.
- **Console logging**
  - None.
- **Hardcoded URLs / values**
  - `PING_TIMEOUT_MS = 15000` (15s) is fixed.
  - URL masking via `.replace(/\/[^/]+$/, "/…")` is in-code behavior, not env-related.

---

### `app/api/test-n8n/route.ts` (diagnostic)

- **Dead / unused**
  - Used by the `/test-n8n` page; not in main customer journeys.
- **Duplicate logic**
  - Another wrapper around `N8N_WEBHOOK_URL`, like `/api/test-webhook`.
- **TODO / placeholder**
  - None.
- **Console logging**
  - `console.error("Error dispatching to n8n webhook", err)` in the fire‑and‑forget fetch.
- **Hardcoded URLs / values**
  - None; webhook URL comes from `N8N_WEBHOOK_URL` env.

---

## App layout and pages (`app/*`, pages/layouts only)

### `app/layout.tsx`

- **Dead / unused**
  - All fonts and `metadata`/`viewport` exports are in use.
- **Duplicate logic**
  - None.
- **TODO / placeholder**
  - None.
- **Console logging**
  - None.
- **Hardcoded URLs / values**
  - Favicon/icon paths and `themeColor` are hardcoded design constants.

---

### `app/page.tsx` (home)

- **Dead / unused**
  - All imported sections are rendered.
- **Duplicate logic**
  - None; just composes sections and `SketchDivider`s.
- **TODO / placeholder**
  - None.
- **Console logging**
  - None.
- **Hardcoded URLs / values**
  - None in this file; content handled by components.

---

### `app/create/layout.tsx`

- **Dead / unused**
  - Simple layout that just returns `children`; nothing unused.
- **Duplicate logic**
  - None.
- **TODO / placeholder**
  - None.
- **Console logging**
  - None.
- **Hardcoded URLs / values**
  - Metadata title/description strings are fixed.

---

### `app/create/page.tsx`

- **Dead / unused**
  - All visible state and handlers are used in the wizard:
    - Possible that some icon imports (`SunMedium`, `User`, `Camera`) and `Checkbox` may be unused if not present in the unseen tail of the file (needs a full-file check to confirm).
- **Duplicate logic**
  - File/drag‑and‑drop + preview URL handling resembles logic in `app/test-n8n/page.tsx`.
- **TODO / placeholder**
  - No explicit `TODO` markers; copy appears intentional.
- **Console logging**
  - None.
- **Hardcoded URLs / values**
  - UI copy (wizard labels, helper texts) are hardcoded strings.

---

### `app/checkout/success/page.tsx`

- **Dead / unused**
  - All state and derived flags (`isStep2Loading`, `isStep3Preview`, `isStep4Completed`) are used.
- **Duplicate logic**
  - Polling with a max attempts + backoff mirrors the pattern used in:
    - `approve-portrait` POST (waiting for WF3 to write URLs).
    - `app/test-n8n/page.tsx` polling Supabase.
- **TODO / placeholder**
  - None.
- **Console logging**
  - None.
- **Hardcoded URLs / values**
  - Country dropdown options are hardcoded.
  - Status messages and button text are fixed strings.

---

### `app/gallery/page.tsx`

- **Dead / unused**
  - All state (`portraits`, `loading`) and effects are used.
- **Duplicate logic**
  - Supabase query is similar to polling logic in `app/test-n8n/page.tsx`, but filters by `showcase_consent === true` and excludes `rejected`.
- **TODO / placeholder**
  - None.
- **Console logging**
  - None.
- **Hardcoded URLs / values**
  - All copy is inline text; no external URLs.

---

### `app/privacy/page.tsx`

- **Dead / unused**
  - All imports and markup used.
- **Duplicate logic**
  - Page shell (Navbar + centered section + Footer) matches support/terms pages.
- **TODO / placeholder**
  - Text includes explicit placeholder: “Full privacy policy coming soon.”
- **Console logging**
  - None.
- **Hardcoded URLs / values**
  - Copy is hardcoded by design.

---

### `app/support/page.tsx`

- **Dead / unused**
  - All imports and markup are used.
- **Duplicate logic**
  - Same shell pattern as privacy/terms.
- **TODO / placeholder**
  - Support copy is generic; no concrete contact details (arguably a content TODO).
- **Console logging**
  - None.
- **Hardcoded URLs / values**
  - All copy is hardcoded.

---

### `app/terms/page.tsx`

- **Dead / unused**
  - All imports and markup used.
- **Duplicate logic**
  - Same shell pattern as privacy/support.
- **TODO / placeholder**
  - Contains explicit placeholder: “Full terms coming soon.”
- **Console logging**
  - None.
- **Hardcoded URLs / values**
  - Copy is hardcoded by design.

---

### `app/test-n8n/page.tsx` (dev utility)

- **Dead / unused**
  - `pollingInterval` state is set but never read; interval ID is stored but not consumed elsewhere.
  - Entire page is for manual/testing and not part of live customer flow.
- **Duplicate logic**
  - Implements:
    - Supabase polling for the latest `pet_portraits` row (similar to gallery/success flow).
    - `/api/create-portrait` upload flow.
    - Direct `/api/receive-n8n-image` bypass.
- **TODO / placeholder**
  - None explicit; all text is descriptive for testing.
- **Console logging**
  - `console.error("Poll error:", error)` and `console.error("Poll error:", err)` while polling.
- **Hardcoded URLs / values**
  - Several placeholder URLs:
    - `"https://example.com/dummy-pet.jpg"`.
    - `"https://placehold.co/400x300?text=Test+Pet"`.

---

### `app/test-loader/page.tsx` (dev utility)

- **Dead / unused**
  - All imports and JSX used.
- **Duplicate logic**
  - Loader preview closely matches loader section used on success/create flows.
- **TODO / placeholder**
  - None.
- **Console logging**
  - None.
- **Hardcoded URLs / values**
  - Uses `/video/FF-Loader.mp4` and references `/public/video/FF-Loader.mp4` in copy.

---

### `app/my-portraits/page.tsx`

- **Dead / unused**
  - `orderId` derived from `searchParams` and used in conditional rendering.
- **Duplicate logic**
  - Page shell pattern (Navbar + section + Footer) matches privacy/support/terms.
- **TODO / placeholder**
  - Text explicitly states: “We’re still wiring up the full experience…”, indicating an unfinished page.
- **Console logging**
  - None.
- **Hardcoded URLs / values**
  - All copy is hardcoded.

---

## Cross-cutting observations

- **Legacy / dev-only surfaces**
  - `app/api/orders/route.ts`, `app/api/test-webhook/route.ts`, `app/api/test-n8n/route.ts`, `app/test-n8n/page.tsx`, `app/test-loader/page.tsx`, and `app/my-portraits/page.tsx` are not part of the main user path and serve debug/legacy roles.
- **Duplicate helpers**
  - `getStripeClient` is defined in both `create-checkout` and `stripe-webhook`.
  - Prompt/name-tag config use appears in both `create-portrait` and `stripe-webhook`.
- **Console logging**
  - API routes are fairly noisy by design (good for debugging). Test pages/routes (`test-n8n`) also log errors.
- **Hardcoded external URLs**
  - `approve-portrait` POST fallback n8n URL.
  - Local dev URL in `create-portrait` error hint.
  - Test placeholder image URLs in `app/test-n8n/page.tsx`.

