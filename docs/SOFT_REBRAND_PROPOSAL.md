# Soft rebrand proposal — align site with logo

**Baseline:** The current design is stabilized as the project baseline. See **`docs/DESIGN_BASELINE.md`** and **`.cursor/rules/fluffyfriends-design-system.mdc`** for the design system used for all pages.

**Goal:** Make the site feel closer to the logo: softer color tones, artistic, warm, and less “tech & AI”.

## Current mismatch

- **Logo:** Soft orange circle, hand-drawn dog and cat, warm cream/black, “Furever Living” — friendly, art-print feel.
- **Site:** Dark charcoal UI, glassmorphism, sharp contrast — reads as tech/dashboard.

## Proposed direction: “Art print shop”

1. **Light, warm base**
   - **Background:** Cream / warm off-white (e.g. `#f5f1e8` or `#faf8f4`) instead of dark charcoal — like paper or a gallery wall.
   - **Text:** Warm brown/charcoal (`#2d2b28` or `#1c1b19`) so it’s soft but readable.
   - **Accent:** Keep the logo orange (`#e8954a` or `#f09a54`) for CTAs and highlights.

2. **Matte, not glass**
   - Replace glassmorphism (backdrop-blur, white/5) with **matte cards**: light cream or white, soft shadow, warm grey border. Feels like paper or card stock, not UI panels.

3. **Navbar & footer**
   - **Nav:** Light cream/white bar, warm text, orange CTA. Optional very subtle shadow to separate from content.
   - **Footer:** Same warm cream or a touch darker (warm grey). Footer logo can stay as-is (no invert) if the background is light, or use a dark-on-light version if you have one.

4. **Hero**
   - Same layout; background follows the new cream base. Glow can stay a soft orange gradient so it still feels warm and on-brand.

5. **Typography**
   - Keep Geist; no need to change font. Slightly softer hierarchy (e.g. not pure black on cream) keeps the “artistic” feel.

## What changes in code

- **`app/globals.css`:** New `:root` palette — background = cream, foreground = warm charcoal, cards = white/cream, borders = warm grey. No structural changes.
- **Components:** Replace glass classes (`bg-white/5`, `backdrop-blur-xl`, `border-white/10`) with matte classes (`bg-white` or `bg-card`, `border-border`, `shadow-sm` or `shadow-md`). Nav/footer use the new semantic tokens so they automatically go light.

## Digital Sketchbook (refinement)

To align further with the hand-drawn logo and avoid a “tech/generic” UI:

- **Typography:** Headings use a friendly, rounded font (Nunito) via `--font-heading`; body stays Geist. All `h1–h6` get the heading font in `globals.css`.
- **Shapes:** Buttons and cards use **organic, imperfect radii** (`rounded-organic`, `rounded-organic-sm`) instead of `rounded-3xl` / `rounded-full` — CSS variables `--radius-organic` and `--radius-organic-sm` in `globals.css`.
- **Dividers:** Section dividers use the `<SketchDivider />` component (hand-drawn style SVG waves) instead of `h-px` lines.
- **Colors:** Unchanged — earthy charcoal for text, warm orange for accents, off-white/cream for backgrounds (see `:root` in `globals.css`).

## Rollback

If you prefer the previous dark, tech look: restore `app/globals.css` from `app/globals.css.rollback` and revert any component class changes (see `docs/DESIGN_ROLLBACK_SNAPSHOT.md`).
