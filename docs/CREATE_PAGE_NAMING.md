# Create page (/create)

The **Make My Portrait** flow lives at `/create`. This doc records naming and structure so you can change them later if needed.

## Page name and metadata

- **URL:** `/create` (route: `app/create/page.tsx`). Changing the URL would require moving the route and updating all links (navbar, footer, CTAs, checkout, gallery).
- **Document title:** Set in `app/create/layout.tsx`:
  - **Title:** `Make My Portrait | FluffyFriends`
  - **Description:** Used for SEO and social previews; focused on one photo, styles, from $17, no subscription.
- **On-page heading:** The wizard shows a dynamic `<h1>`:
  - Before name is entered: **Create your portrait**
  - After name is entered: **Create [Pet Name]'s portrait**

To change the **page title** (browser tab / SEO): edit `metadata.title` in `app/create/layout.tsx`.  
To change the **on-page heading**: edit the `<h1>` in `app/create/page.tsx` (search for `pageTitle`).

## CTA wording

- **Primary submit button (step 3):** "Make My Portrait".
- **Nav and other CTAs:** "Make My Portrait" (navbar, hero, reviews, pricing, etc.).

Keep these in sync with the heading and metadata if you rebrand the flow.

## Wizard steps (current flow)

1. **Choose a theme** — Pick a style (Fireman, Spaceman, etc.) and enter the pet name exactly as you want it to appear in the portrait.
2. **Upload their photo** — Upload one clear photo (dog or cat only). The page explains what makes a great photo and reassures that the photo is checked before payment.
3. **Pay & create** — Summary + consent (age, terms, showcase). Clicking **Make My Portrait** submits to `/api/create-portrait`, then on success the user is sent to checkout.

After success, the user is sent to `/checkout?portrait=<id>` for payment (package selection + Stripe).

## If you rename the route

If you ever move from `/create` to another path (e.g. `/make-my-portrait`):

1. Add a new route folder, e.g. `app/make-my-portrait/page.tsx` (and `layout.tsx` if you use one).
2. Move or re-export the page component and layout from `app/create/`.
3. Add a redirect from `/create` to the new path (in `next.config.js` or Netlify redirects) so old links keep working.
4. Update all internal links: `components/navbar.tsx`, `components/hero-section.tsx`, `components/reviews-section.tsx`, `components/why-fluffyfriends-section.tsx`, `components/gift-section.tsx`, `components/pricing-section.tsx`, `app/checkout/page.tsx`, `app/checkout/success/page.tsx`, `app/gallery/page.tsx`, and any other hrefs to `/create`.
