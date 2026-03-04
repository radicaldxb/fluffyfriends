# Imagery suggestions — where to add more visuals

The hero and gallery already use strong imagery. These suggestions add photos or illustrations in text-heavy sections so the page feels less bland and more “real” without changing copy or structure.

---

## 1. **Immortalise section** (high impact)

**Current:** Centered headline + two paragraphs, no image.

**Suggestion:** Add a single **emotional hero image** beside or below the copy — e.g. a framed portrait on a mantel, a pet portrait on a cozy wall, or a person with their pet and a portrait in the background. Keeps the section emotional and premium.

**Layout options:**
- **A:** Two-column on desktop: copy left, image right (or vice versa), full-width on mobile.
- **B:** Full-width image strip below the headline, then body copy below (or image at bottom of section).
- **C:** Soft background image (very low opacity) behind the text with a subtle overlay so type stays readable.

**Asset:** One hero photo (e.g. `images/immortalise-hero.webp`) — lifestyle shot of a portrait in a home, or a pet + portrait together.

---

## 2. **How it works (Process section)** (high impact)

**Current:** Three cards with icons and text only.

**Suggestion:** Add **one small image per step** so it feels concrete:
- **Step 1 (Choose theme):** Theme preview strip or a grid of 3–4 theme thumbnails (you have `themes/fireman-preview.webp`, `spaceman-preview.webp` — add more and show them here).
- **Step 2 (Upload photo):** Simple illustration or photo of “one clear photo” (phone with pet photo, or upload UI mock).
- **Step 3 (Pay once):** Inbox with two files + print guide, or a framed print + “A1” badge.

**Implementation:** Each card gets an `aspect-video` or `aspect-[4/3]` image area at the top (or left on larger screens). Reuse existing theme previews where possible; one or two new assets for “upload” and “delivery” if needed.

---

## 3. **Why FluffyFriends section** (medium impact)

**Current:** Five feature blocks (icons + text) + comparison table. No photos.

**Suggestion:**
- **Option A:** One **“hero” portrait** at the top of the section (below the intro copy) — e.g. a single strong example with name visible, “This is what we mean by personalised.”
- **Option B:** A **small strip of 2–3 portrait thumbnails** above or below the comparison table to show “FluffyFriends” output without leaving the section.
- **Option C:** Soft **background texture or very subtle pattern** (paper, sketch) so the section isn’t flat cream.

Uses existing gallery/hero assets; no new shoot required if you pull from current portraits.

---

## 4. **About / Our story section** (medium impact)

**Current:** Centered copy only.

**Suggestion:** Add a **single warm, human image** — e.g. team with a pet, founder with dog/cat, or “behind the scenes” (e.g. reviewing portraits, packaging). Builds trust and fits “We’re pet people.”

**Layout:** Image above the headline (full-width) or in a column next to the body (e.g. image right on desktop, stacked on mobile). One asset: `images/about-hero.webp` or `team-pets.webp`.

---

## 5. **Reviews section** (medium impact)

**Current:** Three quote cards, names only, no photos.

**Suggestion:**
- **Option A:** **Small portrait thumbnail** next to each review — “Sarah M. + Biscuit’s portrait” so each quote ties to a real portrait (could be blurred or styled if you don’t have permission to show real customer portraits).
- **Option B:** One **lifestyle image** above or below the grid — e.g. framed portrait on a shelf, or happy customer with their print (with permission).
- **Option C:** Keep cards text-only but add a **single full-width image strip** above the reviews (e.g. “Portraits in real homes” collage or one hero shot).

Easiest win: one strip image above the review cards; no change to card layout.

---

## 6. **Gift section** (lower impact, quick win)

**Current:** Headline, occasion pills, short “how it works” copy, CTA. No image.

**Suggestion:** Add **one image** — e.g. gift box + portrait, or “gift email” mockup, or a wrapped frame. Place above the headline or between the occasion pills and the “You choose a package…” paragraph.

**Asset:** One asset: `images/gift-hero.webp` or reuse a framed portrait from another section.

---

## 7. **Hero differentiator strip** (optional)

**Current:** Four pillars with icons only.

**Suggestion:** Keep icons; add a **very subtle background** — e.g. a faint paper texture, or a soft gradient with a barely-visible portrait silhouette — so the strip doesn’t feel flat. Low priority; only if the rest is done and the strip still feels empty.

---

## Priority order (if doing in phases)

| Priority | Section           | Easiest addition                                      | New assets needed              |
|----------|-------------------|--------------------------------------------------------|--------------------------------|
| 1        | Immortalise       | One hero image (two-column or full-width below title)  | 1 lifestyle/portrait-in-home   |
| 2        | How it works      | Theme previews in step 1; 1–2 images for steps 2 & 3   | 0–2 (reuse themes + 1–2 new)  |
| 3        | About             | One “team / pet people” photo                          | 1                               |
| 4        | Reviews           | One image strip above the cards                        | 1                               |
| 5        | Why FluffyFriends | One hero portrait or small strip above/below table     | 0 (reuse gallery/hero)         |
| 6        | Gift              | One gift-focused image                                 | 1                               |

---

## Technical notes

- Use **Next.js `Image`** with `sizes` and `priority` only where the image is above the fold.
- Prefer **WebP**; keep aspect ratios consistent per section (e.g. 4:5 for portraits, 16:9 or 3:2 for lifestyle).
- Reuse **design tokens**: `rounded-organic`, `border-border`, `bg-card` so new imagery matches the rest of the site.
- For “portrait in a room” shots, ensure the **brand orange** or cream appears somewhere (frame, wall, cushion) to tie into the palette.

Once you have assets, these can be implemented section by section without changing copy or global layout.
