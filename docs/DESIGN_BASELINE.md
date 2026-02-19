# FluffyFriends design baseline

This document describes the **stabilized design system** used as the baseline for all pages. New pages and features should follow it.

## Overview

- **Aesthetic:** “Digital Sketchbook” — warm, personal, human; aligned with the hand-drawn logo.
- **Theme:** Light only — cream/paper background, earthy charcoal text, warm orange accents.

## Tokens and globals

Defined in `app/globals.css`:

| Purpose        | Token / utility              | Value / usage                          |
|----------------|------------------------------|----------------------------------------|
| Background     | `--background`               | Cream/paper (`#faf8f4`)                |
| Text           | `--foreground`               | Charcoal/ink (`#1c1b19`)                |
| Primary        | `--primary`                 | Warm orange (`#e8954a`)                |
| Cards          | `--card`, `--border`         | White, warm grey border                 |
| Section radius | `.rounded-organic`           | Organic 4-corner radius                 |
| Buttons/badges | `.rounded-organic-sm`        | Smaller organic radius                  |
| Headings font  | `--font-heading` (Nunito)   | Applied to all `h1–h6` in base layer   |

## Page structure

Every page should:

1. Render **Navbar** at the top (no logo/tagline strip above it).
2. Wrap content in **`<main className="min-h-screen bg-background">`**.
3. Use **sections** with consistent padding: `py-14 md:py-20`.
4. Separate sections with **`<SketchDivider />`** (no `h-px` dividers).
5. Use content width **`max-w-7xl mx-auto px-4 sm:px-6`** inside sections.
6. Render **Footer** at the bottom (centered: logo, links, trust line, copyright).

## Components

- **Navbar** (`components/navbar.tsx`) — Logo (footer logo asset), nav links, CTA.
- **Footer** (`components/footer.tsx`) — Round logo, Privacy/Terms/Support/Instagram, “We never sell…”, © line.
- **SketchDivider** (`components/sketch-divider.tsx`) — Hand-drawn style wavy line between sections.
- **Button** (`components/ui/button.tsx`) — Uses `rounded-organic-sm`; use for all CTAs.

## Logos

- **Navbar:** `FluffyFriends-Footer-Logo.webp` (horizontal wordmark), heights `h-[2.875rem] sm:h-[3.45rem]`.
- **Footer:** `FluffyFriends-logo.webp` (round icon), `h-[4.6rem] sm:h-[5.75rem]` (and same width).

## Reference

- Design system rule (for AI/editors): `.cursor/rules/fluffyfriends-design-system.mdc`
- Rebrand context: `docs/SOFT_REBRAND_PROPOSAL.md`
- Rollback: `app/globals.css.rollback`, `docs/DESIGN_ROLLBACK_SNAPSHOT.md`
