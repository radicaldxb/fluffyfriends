# Post-generation → Buy flow: suggestions (2026)

**Goal:** Maximize conversion from “portrait ready” to “purchased high-res download.” Balance friction (paywall) with trust (see what you’re buying) and discourage casual theft.

---

## 1. UX flow: portrait ready → purchase (top options)

### Option A — “Unlock” CTA (recommended baseline)

- **After generation:** Show the portrait in a **fixed aspect ratio frame** (e.g. 16:9), **medium resolution** (e.g. max 800px wide), with a **light watermark** (see §3).
- **Single primary CTA:** “Get my 4K download — $29” (or your price). Secondary: “Create another” / “View in gallery.”
- **No “download” or “save” for free:** The only way to get the file is via the buy step.
- **Copy:** One line under the image: “This is a preview. Purchase to download in 4K and print.”
- **Flow:** Click CTA → checkout/payment → after success: **instant download** (or “Download ready” email + link). Optional: “Add to print order” as an upsell on the same page.

**Why it works:** Clear value (you see the result), clear next step (one button), no confusion about free vs paid.

### Option B — Blur / reveal

- Preview is **blurred** (or heavily watermarked) until they tap “Unlock in 4K — $29.” After payment, same view but **full res, no blur**, + download button.
- **Pro:** Strong “premium unlock” feel. **Con:** They can’t fully judge quality before paying; use only if you have a strong guarantee (“love it or refund”).

### Option C — Time-limited “preview” then lock

- Full preview (watermarked) for e.g. **5 minutes**, then image is replaced by a “Preview expired — get your 4K download” block with CTA. Session can keep a reference to “their” portrait so the same image is delivered after purchase.
- **Pro:** Urgency. **Con:** Can feel pushy; use short windows and clear copy.

**Recommendation:** Start with **Option A** (clear preview + one “Get 4K download” CTA). Add urgency (e.g. “Limited time price”) in copy if you want, without a hard lock.

### Flow details that boost conversion (2026-style)

- **One screen, one job:** Success view = “Your portrait” + price + one primary CTA. No extra steps before “Buy.”
- **Trust:** Short line: “Secure payment” / “Instant 4K download after purchase.”
- **Mobile:** CTA sticky or above the fold; portrait visible so they see what they’re paying for.
- **After payment:** “Download 4K” button + optional “Add to print order” so the next step is obvious.

---

## 2. Disable right-click / Save As (deter casual theft)

**Reality:** This is **not** security. It only stops casual users. Determined users can screenshot, dev tools, or use another device.

**What to do:**

- **Disable context menu (right-click)** on the portrait container: `onContextMenu={(e) => e.preventDefault()}`.
- **Disable drag:** `draggable={false}` and/or `onDragStart={(e) => e.preventDefault()}` on the image.
- **“Save as”:** You cannot fully block “Save as” from the browser. You can make the image a **background** (CSS `background-image`) or render it inside a **canvas** so it’s not a simple `<img src="...">` in the DOM; that makes “Save image as” less obvious (they’d have to inspect or screenshot). Downside: accessibility and SEO need a separate approach (e.g. `aria-label`, or a hidden high-res URL only after purchase).

**Suggestions:**

- Do **right-click + drag prevention** on the preview area.
- Optionally render preview via **canvas** or **background-image** so the asset isn’t a direct `<img src="url">` (harder to “Save as”). Keep a proper `<img>` for the **post-purchase** download page if you want (that page is “they paid” so slightly lower theft concern).
- **Don’t** rely on this as real protection; use it as a **deterrent** and pair with watermark + URL handling.

---

## 3. Watermark (clever options)

Goal: Preview is clearly “sample,” full quality only after purchase. Options:

### A. Semi-transparent overlay text

- Text e.g. “PREVIEW — FluffyFriends” or “Unlock 4K” across the image, 15–25% opacity, repeated or centered. Simple and clear.

### B. Diagonal pattern / stripe

- Diagonal band(s) with “PREVIEW” or logo, or subtle stripes. Looks “unfinished” so the 4K download feels like the real product.

### C. Low-res + “4K after purchase”

- Serve a **smaller resolution** for preview (e.g. 800px) and put a small badge: “4K available after purchase.” No heavy graphic watermark; resolution itself is the differentiator.

### D. “Noise” or artifact

- Add a very light noise layer or a soft pattern so the preview is visibly not “clean.” After purchase they get the clean file. (Needs image processing; more work.)

**Recommendation:** **A or C** (or A + C): light “PREVIEW” / “Unlock 4K” text overlay **and** cap preview resolution. Keeps implementation simple and message clear.

---

## 4. Mask / hide image URL

**Reality:** If the image is shown in the browser, something in the client (or network tab) can eventually get a URL or the pixel data. The goal is to make **casual** reuse harder, not to “secure” against skilled users.

**Options:**

### A. Don’t expose the final URL in the DOM

- **Preview:** Don’t use `<img src={publicUrl}>`. Options:
  - **Proxy route:** e.g. `GET /api/portrait-image?id=xxx` that checks session/cookie (and maybe “preview” vs “purchased”), then streams the image or redirects to a signed URL. The visible “src” is your API, not the storage URL.
  - **Blob/object URL:** Backend sends image bytes; frontend does `URL.createObjectURL(blob)` and uses that for `<img>`. The Supabase/storage URL is never in the page.
- **After purchase:** Same idea: download link is “Download from our API” (or time-limited signed URL), not a permanent public storage URL in the HTML.

### B. Signed / time-limited URLs

- Storage (e.g. Supabase) generates a **signed URL** valid for e.g. 5–60 minutes. Preview and download both use such URLs; after expiry the old URL is useless. The “path” in the URL can be opaque (id/token), not a readable file path.

### C. Opaque IDs

- Frontend only ever sees `id=abc123xyz` or a token. The real path (e.g. `generated/n8n-xxx.jpg`) is only on the server. API route maps id → file and streams it (or redirects to a short-lived signed URL).

**Recommendation:**

- **Preview:** Serve via **API route** (e.g. `GET /api/portrait-preview?token=...`) that validates the request (e.g. session that created this portrait) and streams the image (or returns a short-lived redirect). No Supabase public URL in the client.
- **Download (post-purchase):** Same pattern: “Download” hits your API; API checks payment then streams file or returns a short-lived signed URL. No permanent public URL in the page.
- Use **opaque tokens** (not `image_url` with full path) in the frontend; store only the real path or key in the DB.

---

## Summary: what to implement first

| Priority | What | Why |
|----------|------|-----|
| 1 | **Clear buy flow (Option A)** | One screen: preview + “Get 4K download — $29” + trust line. Conversion is critical. |
| 2 | **Right-click + drag disable** | Easy; deters casual “Save as” on preview. |
| 3 | **Preview watermark** | Light “PREVIEW” or “Unlock 4K” overlay + cap preview size (e.g. 800px). |
| 4 | **Preview via API / no URL in DOM** | Proxy or blob so the storage URL isn’t in the page; optional signed/opaque URLs. |
| 5 | **Post-purchase download via API** | Download only after payment; no permanent public URL exposed. |

**Order of work:** (1) Define success screen with CTA and (if you have it) checkout. (2) Add right-click/drag disable and watermark on preview. (3) Introduce API route for preview (and later download) and stop exposing the raw image URL in the client.

If you share your stack (e.g. Stripe, Lemon Squeezy, or “manual” payment), the next step is to wire the “Get 4K download” CTA to checkout and then the post-purchase download flow.
