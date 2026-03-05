# FluffyFriends — Design & flow (for AI and humans)

Use this so we stop reverting to old styles and wrong flows.

---

## Checkout flow (4 steps)

1. **Payment page (Stripe)** — User enters details on `/checkout`, clicks through to Stripe Hosted Checkout.
2. **Payment success (loading)** — Redirect to `/checkout/success?session_id=...&portrait=...`. Show **only**: "Payment received", loader video, short copy. No preview card yet.
3. **Preview page** — When `GET /api/approve-portrait` returns a portrait: show preview image, "Approve this portrait" button, and option to create another. Use **design system** (tokens, `Button`, `rounded-organic-sm`, `SketchDivider`).
4. **Completed page** — After user clicks Approve: show "You're all set" and "Check your email in the next few minutes". No preview, no approve button. Link to create another / home.

Do **not** merge steps 2 and 3 into one screen (e.g. one card that shows "Loading…" then preview). Keep step 2 minimal (loader only), then a separate step 3 section when ready.

---

## Theme (fireman vs spaceman)

- User selects theme on **Create** (e.g. fireman). That theme must reach n8n **order-paid** so the correct theme image and prompt are used.
- **App:** Create page links to checkout with `theme` in the URL: `/checkout?portrait=...&theme=fireman`. Checkout page sends `theme` in the body to `POST /api/create-checkout`. create-checkout stores it in Stripe session **metadata**. Stripe webhook uses `portrait.theme` from DB, with **fallback to `metadata.theme`** so the correct theme is sent to n8n even if the portrait row has no theme yet.
- **n8n:** In "Fetch Theme Image URL" (or similar), use the theme from the webhook body; only fall back to a default (e.g. spaceman) when the value is truly missing. If the app sends `theme: "fireman"` in metadata, it will be in the order-paid payload.

---

## Design system checklist (before any UI change)

1. **Read** `app/globals.css` and `.cursor/rules/fluffyfriends-design-system.mdc`. Use **only** semantic tokens: `bg-background`, `text-foreground`, `text-muted-foreground`, `bg-primary`, `text-primary`, `border-border`, `bg-card`, etc. **No hardcoded hex** (no `#000`, `#F09A54`, etc.) in components.
2. **Buttons:** Use the shared `Button` from `components/ui/button.tsx`. Use `rounded-organic-sm` (already on Button). **Do not use** `rounded-full` for buttons or icon circles.
3. **Cards / panels:** `rounded-organic`. Small surfaces / badges: `rounded-organic-sm`.
4. **Sections:** `py-14 md:py-20`, container `max-w-7xl mx-auto px-4 sm:px-6`. **Between sections:** `<SketchDivider />`, not `h-px` or `<hr />`.
5. **Page shell:** Every page has `Navbar`, `<main className="min-h-screen bg-background">`, then `Footer`.

If you are unsure, copy patterns from `app/checkout/success/page.tsx` (after the latest redesign) or `app/create/page.tsx` for section structure and tokens.

---

## Why this file exists

- So AI and humans don't reintroduce old colors (e.g. pure black, wrong orange) or wrong button shapes (`rounded-full`).
- So the checkout success flow stays clearly 4 steps and the UI matches the rest of the site.
- So the selected theme (e.g. fireman) is preserved all the way to n8n and we don't default to spaceman by mistake.
