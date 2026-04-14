# FluffyFriends — Payment-First Flow Backup
**Captured: April 2026**
**Status: Production flow before preview-first migration**

## Flow summary
1. User picks theme + name (Step 1)
2. User uploads photo — WF1 validates (Step 2)
3. User selects package + pays via Stripe (Step 3)
4. Stripe webhook fires WF2 → generates portrait
5. WF2B quality-checks → notifies app via /api/receive-n8n-image
6. User sees preview on success page → approves
7. Approve fires WF3 → upscales → emails high-res files

## API routes in use (payment-first flow)
- /api/create-checkout — creates Stripe session
- /api/stripe-webhook — handles payment, creates purchase row, fires WF2
- /api/receive-n8n-image — WF2B callback, saves image_url to Supabase
- /api/approve-portrait — GET polls for preview, POST fires WF3
- /api/portrait-balance — checks remaining credits by email
- /api/deduct-portrait — deducts one credit after WF3 fires
- /api/trigger-generation — fires WF2 for returning credit customers

## n8n workflows in use (payment-first flow)
- WF1: /webhook/validate-and-prepare (ID: VReUuMzIX3daxZrjcizPi)
- WF2: /webhook/order-paid (ID: J4r8aoduC5kUi-iKCrKu0)
- WF2B: /webhook/quality-check (ID: TI6dzZ-65Sm5qfG0QQvwt)
- WF3: /webhook/upscale-and-email (ID: AAbWotWCFtInaWGT8ESSA)
- WF4: /webhook/support-request (ID: 1kV_OmOy7733j7NgXDFP3)

## Frontend entry point
- app/create/page.tsx — the full /create funnel
- Stripe checkout fired from: data-gtm="create-step3-checkout" button
- Success page: app/checkout/success/page.tsx

## To revert to this flow
1. In app/create/page.tsx — ensure the checkout button calls
   /api/create-checkout (not create-checkout-v2)
2. Ensure /api/stripe-webhook is registered in Stripe dashboard
   (not stripe-webhook-v2)
3. New API routes (trigger-preview, create-checkout-v2,
   stripe-webhook-v2) can be left in place — they are dormant
   unless called
4. New n8n workflows (WF2-NEW, WF3-NEW) can be left active —
   they are dormant unless called by the new API routes
5. No DB changes needed — schema supports both flows
