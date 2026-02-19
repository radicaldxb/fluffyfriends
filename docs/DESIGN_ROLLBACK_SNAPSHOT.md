# Design rollback snapshot (pre soft-rebrand)

**Date:** 2026-02-18  
**Purpose:** Restore the site to this state if the “soft rebrand” (logo-aligned, artistic) is reverted.

## What was captured

- **Palette:** Dark, warm charcoal background (`#1c1b19`), cream text (`#f5f1e8`), soft orange accent (`#e8954a`). Glassmorphism on cards (white/5, white/10, backdrop-blur).
- **Navbar:** Two rows — brand strip (logo + “Your Pet, Reimagined as Fine Art”) + nav row with links and CTA. Sticky, blur background.
- **Hero:** Left = trust badge, h1 “Your Pet, Reimagined as Fine Art”, copy, buttons. Right = before/after slider only.
- **Sections:** Process, Print options, Pricing, Reviews use glass-style cards (border-white/10, bg-white/5, backdrop-blur).
- **Footer:** Large white footer logo (FluffyFriends-Footer-Logo.webp with invert filter), warm semantic colors.

## How to roll back

1. **Restore global styles**  
   Copy `app/globals.css.rollback` over `app/globals.css`.

2. **Restore component styles** (changed during soft rebrand)  
   - **Navbar:** `bg-background/80 backdrop-blur-xl` → was `bg-background/80 backdrop-blur-xl`; change back to that and remove `shadow-sm` if you want exact match.
   - **Process cards:** `border border-border bg-card p-8 shadow-md` → `border border-white/10 bg-white/5 p-8 backdrop-blur-xl shadow-[0_18px_50px_rgba(0,0,0,0.35)]` (and hover classes).
   - **Pricing cards:** same — restore `border-white/10 bg-white/5 backdrop-blur-xl` and glass shadows.
   - **Print options cards:** same matte → glass. Placeholder `bg-muted/50` → `bg-white/[0.06]`.
   - **Reviews cards:** same matte → glass.
   - **Footer:** `bg-secondary/60` → `bg-card`; logo add back `[filter:brightness(0)_invert(1)]`.
   - **Hero:** trust badge `bg-secondary` → `bg-secondary/50 backdrop-blur-sm`; glow `rgba(232,149,74,0.15)` → `var(--brand-orange)` with opacity-20.

3. **Quick rollback (theme only)**  
   Restoring only `app/globals.css` from `app/globals.css.rollback` brings back the dark palette; then re-apply the glass/matte changes above if you want the exact previous look.

## Files to restore from backup

- `app/globals.css` ← use `app/globals.css.rollback`
