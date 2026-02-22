# Pricing logic & technical structure (single, 4-pack, future print)

---

## A) Pricing logic — psychological pricing so the 4-pack feels like the smart choice

### Goal

- **Single:** One portrait (one style), clear price.
- **4-pack:** Bundle of 4 portraits (same or mixed styles), **higher total price** but **lowest per-portrait** so it feels like the “cheapest” option in terms of value.
- **Future:** Print-on-demand as an add-on or separate product; structure should allow it without redoing everything.

### Psychological tactics

| Tactic | How to use it |
|--------|----------------|
| **Anchor the single** | Show single price first ($29). It sets the reference. |
| **Bundle = “Best value”** | 4-pack labeled “Best value” or “Most popular,” with **per-portrait price** visible: e.g. “$19/portrait when you buy 4.” |
| **Savings framing** | “Save 34%” or “4 for the price of 3” next to the 4-pack. |
| **Three options (optional)** | Single | 4-pack (highlighted) | 4-pack + print (future). Middle option as default recommendation. |

### Example pricing (you can plug in your own numbers)

| Product | Total price | Per portrait | Message |
|---------|-------------|--------------|---------|
| **1 portrait** (4K download) | $29 | $29 | “One portrait” |
| **4 portraits** (4K download) | $79 | $19.75 | “Best value — save 32%” or “$19/portrait” |

So the **cheapest way to get more** is the 4-pack; the single is for “just one” or trial.

### How it works in the flow

- **Create flow:** User generates **one** portrait (one style). That’s the “current” portrait.
- **Checkout:** User chooses **product**:
  - **Single:** Pay $29 → get 4K of this one portrait.
  - **4-pack:** Pay $79 → get 4K of this portrait **plus** 3 more (they come back to create 3 more later, or you allow “use this one + 3 credits” — see structure below).
- **Future print:** Same products can have a “+ print” variant (e.g. “4-pack + 1 printed” at $99), or print as separate line item. Pricing logic stays: single anchor, bundle = best value, print = add-on.

**Summary A:** Single = anchor price. 4-pack = higher total, lower per-portrait, labeled “Best value.” Show per-portrait and “Save X%” on the 4-pack. Structure so print can be added as another product or add-on later.

---

## B) Structure and technical side

### 1. Products (what you sell)

You need a **single source of truth** for products and prices (so you can change prices and add print later without hardcoding everywhere).

**Option 1 — Config in code (simplest for now)**  
- Constants or a small config file, e.g.:

```ts
// lib/products.ts or config
export const PRODUCTS = [
  { id: 'single_4k', name: '1 Portrait (4K)', price: 2900, priceDisplay: '$29', perPortrait: 1, type: 'download' },
  { id: 'pack_4_4k', name: '4 Portraits (4K)', price: 7900, priceDisplay: '$79', perPortrait: 4, type: 'download', badge: 'Best value', savePercent: 32 },
]
// Later: { id: 'pack_4_print', name: '4 Portraits + 1 Print', price: 9900, ... }
```

**Option 2 — Database table (better for non-devs, future print, promos)**  
- Table `products`: `id`, `name`, `price_cents`, `per_portrait`, `type` (e.g. `download` | `print`), `badge`, `sort_order`.  
- App and checkout read from DB; you can add print products and change prices without deploys.

Recommendation: start with **config**; move to **DB** when you add print or want to edit prices in an admin.

---

### 2. What the user “has” at checkout

- **Current portrait:** One generated image (one style), stored in `pet_portraits` with an `id`.  
- At checkout they are buying **either**:
  - **Single:** That one portrait (1× 4K download).
  - **4-pack:** That one portrait **plus 3 more** (4× 4K downloads). The “3 more” can be:
    - **Credits:** They get a link/account to create 3 more later (you track “remaining credits” per order/user), or  
    - **Same image in 4 styles:** You only have one image; “4-pack” could mean “we’ll generate 3 more styles for the same pet” (different flow), or  
  - Simplest: **4-pack = 1 portrait now + 3 creation credits** (they return to /create three more times; you deduct credits).

So technically:

- **Single:** `order` → 1 `order_item` → 1 portrait id → deliver 1× 4K.  
- **4-pack:** `order` → 1 `order_item` (product = 4-pack) → 1 portrait id (the one they just made) + 3 “credits” or “slots” for future portraits. Delivery: 1× 4K now; when they create the next 3, you deliver 4K for those too (and decrement credits).

---

### 3. Orders and order items (technical)

You need to record **who bought what** and **which portrait(s)**.

**Minimal schema:**

- **`orders`**  
  - `id`, `email`, `name` (optional), `amount_cents`, `payment_provider`, `payment_id` (Stripe/LS session or payment id), `status` (`paid` | `refunded`), `created_at`.

- **`order_items`**  
  - `id`, `order_id`, `product_id` (e.g. `single_4k` or `pack_4_4k`), `quantity` (usually 1), `price_cents`, `metadata` (JSON).

- **Linking to portraits:**
  - **Option A:** `order_items.metadata = { portrait_ids: [uuid], credits_remaining: 3 }` for 4-pack (1 portrait now, 3 credits).  
  - **Option B:** Separate table `order_portraits`: `order_id`, `portrait_id`, `delivered_at` (when you sent the 4K). For 4-pack you’d have 1 row now, 3 rows when they use credits.

**Checkout flow (technical):**

1. User on `/checkout?portrait_id=xxx` (or portrait_id in session).  
2. Load products (from config or DB).  
3. User enters **email** (required), **name** (optional).  
4. User selects **product**: Single or 4-pack.  
5. Frontend calls your **API** (e.g. `POST /api/create-checkout`) with: `email`, `name`, `product_id`, `portrait_id`.  
6. Backend: create **order** (status `pending`), create **order_item** with `product_id` and `metadata: { portrait_ids: [portrait_id], credits_remaining: 3 }` for 4-pack or `{ portrait_ids: [portrait_id] }` for single.  
7. Backend: create Stripe Checkout Session (or Lemon Squeezy) with `metadata: { order_id }` and success/cancel URLs.  
8. Redirect user to Stripe/LS payment page.  
9. **Webhook** (payment success): set `orders.status = 'paid'`, then:
    - **Single:** Generate 4K download link for the one portrait; send email with link (and attach order + email/name to that portrait if you want).  
    - **4-pack:** Same for the first portrait; store `credits_remaining: 3` (in order_item metadata or a small `credits` table). When they come back and create portrait 2, 3, 4, you check credits and deliver 4K for each, decrementing.

So: **pricing logic** lives in products (single vs 4-pack, prices, “Best value”); **structure** is orders + order_items + portrait linkage and optional credits for the 4-pack.

---

### 4. Where to capture email and name

- **Same place as today:** On **`/checkout`** (single page).  
- **Form:** Email (required), Name (optional).  
- **Then:** Product choice (Single vs 4-pack), then “Pay” → your API creates order + order_item + Stripe session → redirect to payment.  
- So: **one page, one flow:** email + name → product choice → payment. No extra steps.

---

### 5. Future: print-on-demand

- **Products:** Add new products, e.g. `single_4k_print`, `pack_4_print`, or “Print add-on” with a price.  
- **Order items:** Same `order_items` table; `product_id` can be `single_4k`, `pack_4_4k`, `single_print`, etc.  
- **Fulfilment:** When order is paid, for items with `type: 'print'` you call your print API (and pass portrait_id, size, etc.); for `type: 'download'` you send 4K link as today.  
- **Pricing logic unchanged:** Single print = anchor; 4-pack or “4-pack + print” = best value, with per-item and “Save X%” framing.

---

## Summary

| Topic | Answer |
|-------|--------|
| **A) Pricing logic** | Single = anchor (e.g. $29). 4-pack = higher total (e.g. $79), lower per-portrait, “Best value” + “Save X%.” Psychological goal: cheapest way to get more = 4-pack. Print later = add-on or extra product with same idea. |
| **B) Structure** | **Products:** config or DB (id, name, price, per_portrait, type, badge). **Orders:** id, email, name, amount, payment_id, status. **Order items:** order_id, product_id, metadata (portrait_ids, credits_remaining for 4-pack). **Checkout:** one page, email + name → product choice → create order + Stripe session → redirect; webhook marks paid and delivers 4K (and credits for 4-pack). **Print:** later, new product type and fulfilment step. |
| **Where capture email/name** | On `/checkout`, in the same step as product selection and payment (one page). |

If you want, next step can be: define the exact product IDs and prices in code, then implement `/checkout` (form + product choice + call to `POST /api/create-checkout`) and the minimal `orders` / `order_items` schema plus Stripe (or Lemon Squeezy) flow.
