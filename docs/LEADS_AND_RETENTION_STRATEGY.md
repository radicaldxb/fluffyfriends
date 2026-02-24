# Leads, free generations, and retention strategy

Backup of the agreed logic for free generations, email capture, and follow‑up offers (Feb 2026).

---

## 1. Free generations logic

- **3 free generations per open session** (no email required).
- **+2 extra free generations after email + consent**:
  - Total of **5** free portrait generations per engaged visitor.

Implementation guidelines:

- **Front‑end (soft limit):**
  - Track `free_generations_used` in `localStorage`.
  - On `/create` submit:
    - If `free_generations_used < 3`: allow, then increment.
    - Once `>= 3`: show an email gate:
      - “Enter your email to unlock 2 more free portraits and get 15% off your first order.”
      - On submit, store email + consent, set `free_generations_limit = 5`.
    - If `free_generations_used >= free_generations_limit`: block new generations and direct to purchase.

- **Backend (hard limit, future):**
  - Add a `leads` / `generation_limits` table keyed by email (or IP/UA if anonymous).
  - Before calling n8n in `/api/create-portrait`, check:
    - If this email (or identifier) is over their allowed free limit → return 429/403 with a clear message.

---

## 2. Post‑generation screen (\"Your portrait\" view)

After a portrait is generated, do **not** drop users into the gallery. Keep them on a dedicated result view:

- Show **only the just‑generated portrait** (hero).
- **Primary CTA:** “Buy this portrait” (goes to checkout with `portrait_id`).
- **Secondary CTA:** “Try another style” / “Generate another”.
- **Email capture block under CTAs:**
  - Headline: “Get 15% off your first order”.
  - Form: `email` + [Get 15% off].
  - Copy: “We’ll send your discount and a link to your portrait so you can come back later. 1–2 emails/week, unsubscribe anytime.”

This is the main place to collect emails of people who liked what they saw but didn’t buy yet.

---

## 3. Gallery and consent logic

- Use `showcase_consent` and a purchase signal (`purchased` or orders table) to control what appears publicly:
  - **Early stage (to make the site look full):**
    - Gallery filter: `status = 'completed' AND showcase_consent = true`.
  - **Later, mature stage:**
    - Gallery filter: `status = 'completed' AND showcase_consent = true AND purchased = true`.

Key principles:

- Only **consented** portraits show in public gallery.
- Over time, bias or restrict gallery to **purchased** portraits only.
- Personal access to a user’s own portraits should not depend on the public gallery (use local “My portraits” view if needed).

---

## 4. Lead capture touchpoints

**A. After first portrait (result page):**

- As described in section 2: email capture under the “Buy” CTA, offering **15% off** and a save‑my‑portrait link.

**B. After free cap hit:**

- When `free_generations_used` reaches the cap (3 without email, 5 with email):
  - Show a modal/gate:
    - “You’ve reached your free preview limit. Get 15% off and unlock more portraits by entering your email.”
  - If they already gave email, push them toward purchase instead of giving more free runs.

**C. Exit‑intent on result page (optional, desktop only):**

- If user tries to close/leave the tab or lingers for ~30–60 seconds without buying:
  - Show a light modal:
    - “Wait – keep your pet’s portrait + 15% off”
    - Email field + CTA to send discount and portrait link.

All three touchpoints write into a `leads` table with:

- `email`
- `source` (e.g. `post_generation`, `limit_gate`, `exit_intent`)
- `first_portrait_id` (nullable)
- timestamps + flags for discount usage.

---

## 5. 2‑day follow‑up email (rescue offer)

Goal: convert people who generated a portrait, left without buying, but gave email + consent.

Logic:

1. Lead is created with email + consent and at least one `portrait_id`.
2. No purchase associated with that `portrait_id` within ~48 hours.
3. Trigger a **2‑day later email**:
   - Subject: “Blacky looks incredible – here’s your portrait + extra X% off”.
   - Body:
     - Show 1–3 of their generated portraits (from `image_url` / `original_image_url`).
     - One primary CTA: “Complete your order with X% off”.
     - Mention expiry (e.g. “Offer valid for 48 hours”).

Discount structure:

- On‑site/initial email offer: **15% off first order**.
- Rescue email: **+5–10%** extra, once, tracked via:
  - `rescue_offer_sent` boolean,
  - `rescue_code` / `rescue_code_used` flags.

Implementation detail:

- The 2‑day trigger can be:
  - A simple scheduled job / cron hitting a small API that:
    - Finds leads with `created_at <= now - 2 days`, `rescue_offer_sent = false`, and no purchase.
    - Sends email via your ESP and marks `rescue_offer_sent = true`.
  - Or an automation in your email platform (send event from app → delay → check purchase → send offer).

---

## 6. Summary

- **Free runs:** 3 free + 2 more after email/consent, capped per email and soft‑tracked per browser.
- **Conversion focus:** Always show a dedicated “Your portrait” screen with a strong “Buy” CTA and an integrated email/discount block.
- **Gallery:** Only consented images; later, optionally only purchased ones.
- **Leads:** Central `leads` table with email, source, portrait ids, and discount usage.
- **Retention:** 2‑day rescue email with their actual portraits and a slightly better discount to recover non‑buyers.

