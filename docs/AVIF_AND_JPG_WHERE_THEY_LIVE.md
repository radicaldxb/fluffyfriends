# Where .avif and .jpg live (Cloudinary flow)

With the **Cloudinary** flow, nothing is uploaded to your **Supabase Storage** “generated” folder. Both the display image and the original are **URLs** stored in the **database** only.

---

## What gets stored

| What | Where | Example |
|------|--------|--------|
| **Display image (.avif)** | `pet_portraits.image_url` | `https://res.cloudinary.com/.../f_avif,q_auto/.../xxx.avif` |
| **Original (.jpg)** | `pet_portraits.original_image_url` | `https://res.cloudinary.com/.../v123/xxx.jpg` (or same id, no transformation) |

Both are **Cloudinary URLs**. There is **no file** in Supabase Storage `images/generated/` for this flow. So **path: null** and an empty “generated” folder are correct.

---

## How to verify

1. **API response**  
   When n8n calls `/api/receive-n8n-image`, the response now includes:
   - `original_image_url_stored: true` → we received and stored the .jpg URL.
   - `original_image_url: "https://res.cloudinary.com/..."` → the exact URL saved (open it in a browser to see the .jpg).

2. **Supabase**  
   Table Editor → **pet_portraits** → latest row:
   - **image_url** = .avif (used for display).
   - **original_image_url** = .jpg/original (used for upscaling / high-res later).  
   If this column is empty, n8n is not sending `original_image_url` in the body (see N8N_JPG_NOT_SAVING.md).

---

## Summary

- **.avif** → `image_url` in DB (and in API response as `image_url`).
- **.jpg** → `original_image_url` in DB (and in API response as `original_image_url` when stored).
- **Generated folder** → empty for this flow; files live on Cloudinary.

Run **`supabase/run-add-original-image-url.sql`** once if the `original_image_url` column doesn’t exist yet.
