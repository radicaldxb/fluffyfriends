# Homepage batch fixes — validation summary

This document validates the eight UI/UX fixes applied in a single batch (hero, gallery, pricing, navigation). Use it for QA and release notes.

---

## ACTION 1 — Hero image: no black flash on load

**Files:** `components/hero-portrait-rotator.tsx`

| Change | Detail |
|--------|--------|
| Background | Main portrait frame uses **`bg-muted`** (warm cream, `#f0ebe3` via tokens) instead of **`bg-foreground`**, which read as a black/dark block while images loaded. |
| Shadow / edge | **`shadow-black/10`** + **`ring-1 ring-border/50`** replace the old dark-card shadow. |
| Preload | First slide already uses **`priority={i === 0}`** on the main `Image` (and the first “before” thumb). |

**How to verify:** Hard-refresh `/` on a throttled network; the hero frame should show cream, not charcoal, before the portrait appears.

---

## ACTION 2 — Hero overlay badges

**Files:** `components/hero-portrait-rotator.tsx`

| Badge | Change |
|-------|--------|
| Theme (top-left) | Removed grey **“Theme”** label; only **🚒 Fireman / 👑 Queen / 👑 King** show. **`text-base font-bold`**, **`px-4 py-3`**. |
| After ✨ (top-right) | **`text-sm font-bold`**, **`px-4 py-2`**, **`rounded-organic-sm`**, orange primary unchanged. |
| Before thumbnail | Removed **“Before”** pill; photo-only. |
| Print ready / A1 | **Print ready** `text-xs`; **Up to A1 ↑** **`text-base font-bold`**; **`px-4 py-3`**. |

---

## ACTION 3 — Gallery performance & link

**Files:** `components/gallery-section.tsx`

| Change | Detail |
|--------|--------|
| Lazy load | Each grid **`Image`** has **`loading="lazy"`**. |
| Data cap | **`GALLERY_LIMIT = 8`**. Query uses **`.eq("showcase_consent", true)`** and **`.limit(8)`** (no oversized fetch + client filter). |
| Footer link | Replaced orange button with centred text link **“See all portraits →”** → **`/gallery`**. |

**How to verify:** Network tab: at most eight portrait requests from Supabase; grid shows ≤8 items; link goes to full gallery page.

---

## ACTION 4 — Mobile hero: portrait first, full width, aspect

**Files:** `components/hero-section.tsx`, `components/hero-portrait-rotator.tsx`

| Change | Detail |
|--------|--------|
| DOM / layout | Portrait column **first** in DOM; **`lg:flex-row-reverse`** so desktop stays **copy left / portrait right** without `order-*` hacks. |
| Mobile width | Portrait column: **`-mx-6`**, **`w-[calc(100%+3rem)]`**, **`max-w-[100vw]`** below `sm`; resets at **`sm:`**+ for alignment. |
| Rotator | **`w-full max-w-none lg:max-w-md`**; main card **`aspect-[3/4] lg:aspect-[4/5]`**. |

---

## ACTION 5 — Mobile hero CTAs full width

**Files:** `components/hero-section.tsx`

| Change | Detail |
|--------|--------|
| Buttons | Both CTAs: **`w-full sm:w-auto`**, **`justify-center`**; wrapper **`w-full max-w-xl`**, **`sm:justify-start`**. |

---

## ACTION 6 — Mobile pricing: one card per row + order

**Files:** `components/pricing-section.tsx`

| Change | Detail |
|--------|--------|
| Grid | **`grid-cols-1 md:grid-cols-3`**. |
| Mobile order | **Portrait Pack** first → **`order-1 md:order-2`**; **Starter** **`order-2 md:order-1`**; **Family Pack** **`order-3 md:order-3`**. |

**How to verify:** &lt;768px: stacked cards, Portrait Pack on top; ≥md: Starter | Portrait Pack | Family left to right.

---

## ACTION 7 — Navigation audit

**Files:** `components/navbar.tsx`

| Change | Detail |
|--------|--------|
| Create | **“Get started”** → **“Create Portrait”** with **`href="/create"`** (no `/#final-cta`). |
| Anchors | **`/#gallery`**, **`/#process`**, **`/#reviews`**, **`/#pricing`**, **`/#about`** match `id`s on gallery, how-it-works, reviews, pricing, about sections. Comment in file documents this. |

---

## ACTION 8 — “Browse the gallery” visible border

**Files:** `components/hero-section.tsx`

| Change | Detail |
|--------|--------|
| Outline CTA | Secondary button: **`border-2 border-foreground/20`**, **`hover:border-foreground/30`**. |

---

## Quick smoke checklist

- [ ] Home hero: cream frame, no black flash; badges readable on mobile.
- [ ] Gallery: ≤8 images; “See all portraits →” works.
- [ ] Hero mobile: portrait above headline; CTAs full width; outline gallery button visible.
- [ ] Pricing mobile: one column; Portrait Pack first.
- [ ] Nav: anchors scroll correctly; “Create Portrait” opens `/create`.
- [ ] Desktop layouts unchanged for hero row, pricing three-column, nav.

---

*Generated for batch validation; amend this file if follow-up tweaks land.*
