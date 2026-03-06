## Database schema (FluffyFriends)

This document describes the core PostgreSQL tables used by the FluffyFriends app and n8n workflows.

### Overview

- **public.users** – contact and location details collected on the checkout success page.
- **public.pet_portraits** – all portraits created or attempted, linked to users and workflows.
- **public.orders** – historical orders table (no longer used by the new flow, kept for reference).
- **public.order_items** – line items per order (no longer used by the new flow, kept for reference).
- **public.theme_prompts** – prompt configuration for each portrait theme.

---

### Table: `public.users`

Stores customer details collected after payment (success page form).

| Column               | Type        | Constraints                     | Notes                                      |
|----------------------|------------|---------------------------------|--------------------------------------------|
| `id`                 | `uuid`     | PK, `default gen_random_uuid()` | Internal identifier                        |
| `email`              | `text`     | `not null`, `unique`           | Used for upsert on success form            |
| `full_name`          | `text`     |                                 | Display name                               |
| `city`               | `text`     |                                 | Shipping / location hint                   |
| `country`            | `text`     |                                 | ISO country name or code                   |
| `state`              | `text`     |                                 | Region / state when applicable            |
| `newsletter_consent` | `boolean`  | `default false`                | Opt‑in for emails beyond transactional     |
| `created_at`         | `timestamptz` | `default now()`              | Insert time                                |
| `updated_at`         | `timestamptz` | `default now()`              | Updated on profile changes                 |

**Relationships**

- Referenced by `public.pet_portraits.user_id`.

**RLS**

- RLS is enabled and policies allow the **anon** role (Supabase anon key) to:
  - `INSERT` – create new users on success form submit.
  - `SELECT` – read user `id` after upsert.
  - `UPDATE` – update existing rows on `ON CONFLICT (email)` upsert.

---

### Table: `public.pet_portraits`

Central table for all portraits and intermediate statuses.

| Column             | Type          | Constraints                     | Notes                                                      |
|--------------------|--------------|---------------------------------|------------------------------------------------------------|
| `id`               | `uuid`       | PK, `default gen_random_uuid()` | Portrait identifier, also used in Stripe metadata          |
| `created_at`       | `timestamptz`| `not null`, `default now()`    | Creation time (usually WF1 insert)                         |
| `title`            | `text`       |                                 | Legacy / not currently used                                |
| `image_url`        | `text`       |                                 | Preview image (AVIF / gallery image)                       |
| `pet_name`         | `text`       |                                 | Name of the pet (used in prompts + fallback matching)      |
| `status`           | `text`       |                                 | e.g. `pending_payment`, `generating`, `preview`, `completed`, `rejected` |
| `user_email`       | `text`       |                                 | Legacy email column (may be redundant once users table is used) |
| `original_image_url` | `text`     |                                 | Raw uploaded image or Gemini / Cloudinary original         |
| `rejection_reason` | `text`       |                                 | Reason for validation rejection (e.g. multiple animals)    |
| `showcase_consent` | `boolean`    | `default true`                 | Whether this portrait can appear in gallery / marketing    |
| `theme`            | `text`       |                                 | Theme key (e.g. `fireman`, `spaceman`)                     |
| `validation_text`  | `text`       |                                 | Free‑text validation notes from WF1 (if used)              |
| `user_id`          | `uuid`       | FK → `public.users(id)`        | Links portrait to a user record                            |
| `landscape_url`    | `text`       |                                 | Upscaled wide format URL from WF3                          |
| `portrait_url`     | `text`       |                                 | Upscaled tall format URL from WF3                          |

**Key interactions**

- **WF1 (validate-and-prepare)** inserts an initial row with `status` like `pending_payment`.
- **Stripe Checkout metadata** includes `portrait_id` so webhooks can find this row.
- **WF2 (order-paid)** writes preview + `original_image_url` for the generated portrait:
  - Ideal path: WF2 calls `/api/receive-n8n-image` with `portrait_id`, `image_url` and `gemini_image_url`, updating this row in place.
  - Historical path: WF2 sometimes inserted a new `completed` row; `approve-portrait` has a fallback that searches latest `completed` portrait by `pet_name`.
- **WF3 (upscale-and-email)** updates `landscape_url` and `portrait_url` for downloads and email links.
- **`/api/approve-portrait` (POST)** attaches a `user_id` after form submission.

---

### Table: `public.theme_prompts`

Defines prompts and name‑tag behaviour for each theme.

| Column               | Type          | Constraints                     | Notes                                      |
|----------------------|--------------|---------------------------------|--------------------------------------------|
| `id`                 | `uuid`       | PK, `default gen_random_uuid()` |                                            |
| `theme_name`         | `text`       | `not null`, `unique`           | E.g. `fireman`, `spaceman`                 |
| `prompt`             | `text`       | `not null`                     | Base prompt text fed into Gemini           |
| `created_at`         | `timestamptz`| `not null`, `default now()`    |                                            |
| `updated_at`         | `timestamptz`| `not null`, `default now()`    |                                            |
| `active`             | `boolean`    | `not null`, `default true`     | Feature‑flag per theme                     |
| `has_name_tag`       | `boolean`    | `not null`, `default false`    | Whether theme supports name patches        |
| `name_tag_instruction` | `text`     |                                 | Exact wording for the name‑tag instruction |

**Key interactions**

- Used by backend helper `getPromptAndNameTagConfig(theme)` to:
  - Fetch the base prompt.
  - Append name‑tag instructions when needed.
  - Replace `{{ PET_NAME }}` placeholders with the actual pet name.

---

### Table: `public.orders` (legacy)

Previous implementation for recording orders in Supabase before Stripe‑only flow.

| Column            | Type          | Constraints                     | Notes                                     |
|-------------------|--------------|---------------------------------|-------------------------------------------|
| `id`              | `uuid`       | PK, `default gen_random_uuid()` | Order identifier                          |
| `email`           | `text`       | `not null`                     | Customer email                            |
| `name`            | `text`       |                                 | Customer name                             |
| `amount_cents`    | `integer`    | `not null`                     | Total amount in cents                     |
| `status`          | `text`       | `not null`, default `'pending'` with check | Enum: `pending`, `paid`, `refunded`, `test` |
| `payment_provider`| `text`       |                                 | E.g. `stripe`                             |
| `payment_id`      | `text`       |                                 | Provider‑specific ID                      |
| `credits_valid_until` | `timestamptz` |                            | For credit‑based models (unused now)     |
| `created_at`      | `timestamptz`| `not null`, `default now()`    |                                           |

This table is **no longer used** by the current flow, which relies on Stripe Checkout + webhooks as the source of truth.

---

### Table: `public.order_items` (legacy)

Line items for legacy `orders`.

| Column             | Type          | Constraints                     | Notes                                      |
|--------------------|--------------|---------------------------------|--------------------------------------------|
| `id`               | `uuid`       | PK, `default gen_random_uuid()` |                                            |
| `order_id`         | `uuid`       | `not null`, FK → `orders(id)`   | Parent order                               |
| `product_id`       | `text`       | `not null`                      | E.g. `starter`, `portrait_pack`           |
| `price_cents`      | `integer`    | `not null`                      | Price per unit in cents                    |
| `quantity`         | `integer`    | `not null`, `default 1`         |                                            |
| `portrait_ids`     | `uuid[]`     | `default '{}'::uuid[]`          | Linked portrait ids (legacy association)   |
| `credits_remaining`| `integer`    | `default 0`                     | For credit bundles (unused now)           |
| `created_at`       | `timestamptz`| `not null`, `default now()`     |                                            |

As with `orders`, this table is **legacy** and kept for backwards compatibility / data audit.

