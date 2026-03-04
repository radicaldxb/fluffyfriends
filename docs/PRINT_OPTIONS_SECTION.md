# Print Options Section (temporarily removed)

The **Print Options** section has been removed from the homepage for now. The component and its content are kept in the codebase so we can turn it back on when we reach that point.

## What was removed

- **Section:** “Make your walls as unique as your pet” — three options: Framed wall art, Gallery trio, Gift‑ready bundle.
- **Location on homepage:** It used to sit between **About** and **Pricing**, with `SketchDivider` above and below.

## How to restore it

1. **Re-add the section in `app/page.tsx`:**
   - Import: `import { PrintOptionsSection } from "@/components/print-options-section"`
   - Place it between About and Pricing, with `SketchDivider` on both sides:

   ```tsx
   <AboutSection />
   <SketchDivider />
   <PrintOptionsSection />
   <SketchDivider />
   <PricingSection />
   ```

2. **Component:** `components/print-options-section.tsx` — no changes needed; use as-is when restoring.

## When to bring it back

Re-enable this section when you’re ready to highlight physical print products (framed art, gallery sets, gift bundles) and have clear offers or CTAs for them.
