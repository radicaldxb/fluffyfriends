# n8n-facing API contracts

Single reference for the three app endpoints that n8n calls or that call n8n.

---

## 1. Order-paid (we call n8n)

**App → n8n:** After Stripe checkout, the app POSTs to `N8N_ORDER_PAID_WEBHOOK_URL` with:

| Field               | Type    | Description |
|---------------------|---------|-------------|
| `portrait_id`       | string  | UUID of the portrait row |
| `pet_image_url`     | string  | Original upload URL (Supabase Storage) |
| `pet_name`          | string  | Pet name |
| `theme`             | string  | Theme id (e.g. `fireman`, `king`) |
| `order_id`          | string  | Stripe payment intent ID (same as `payment_intent_id`) |
| `payment_intent_id` | string  | Stripe payment intent ID |
| `user_email`       | string  | Customer email |
| `user_first_name`  | string  | First name from Stripe |
| `total_cents`       | number  | Amount paid (cents) |
| `currency`          | string  | e.g. `usd` |
| `showcase_consent`  | boolean | Whether user allowed gallery use |

n8n uses this to run WF2 (generate portrait, then call receive-n8n-image).

---

## 2. Receive-n8n-image (n8n calls us)

**POST** `/api/receive-n8n-image`  
**Auth:** If `N8N_WEBHOOK_SECRET` is set, send `X-Webhook-Secret` or `Authorization: Bearer <secret>`.

**Body (JSON):**

- **With `portrait_id` (WF2 path):**  
  `portrait_id`, optional: `image_url`, `gemini_image_url`, `status`, `payment_intent_id`. Updates existing portrait row.
- **Rejection path:**  
  `rejected: true`, `reason`, `original_image_url` (or `test_image`), optional `pet_name`. Inserts a row with `status: "rejected"`.
- **Legacy / no portrait_id:**  
  `image_base64` or `image_data_url` or `image_url` (to fetch), plus `original_image_url`/`test_image`, `pet_name`, `user_email`, `showcase_consent`, `status`. Matches by `original_image_url` or inserts new row.

See `app/api/receive-n8n-image/route.ts` and docs (e.g. CLOUDINARY_NAMETAG_N8N.md, AVIF_AND_JPG_WHERE_THEY_LIVE.md) for full field list.

---

## 3. Set-portrait-download-urls (n8n calls us)

**POST** `/api/set-portrait-download-urls`  
**Auth:** Same as receive-n8n-image (`N8N_WEBHOOK_SECRET`).

**Body (JSON):** `portrait_id` (required), `landscape_url`, `portrait_url` (at least one URL required).

See [WF3_STORE_DOWNLOAD_URLS.md](./WF3_STORE_DOWNLOAD_URLS.md) for n8n setup.
