# AVIF workflow and image pipeline

This doc describes the recommended image flow: **Gemini → .avif (Cloudinary) → Supabase**, plus how it fits gallery, purchase, upscale, and downloads.

---

## Recommended flow: Gemini → Cloudinary (.avif) → Supabase

**Yes: Gemini → .avif converter → Supabase** is the right idea. Concretely:

1. **n8n:** After GEMINI (and optional name-tag overlay), send the image to **Cloudinary**.
2. **Cloudinary:** Upload the image and use an **eager** transformation to generate an **.avif** (and optionally keep the original). Cloudinary hosts the file and returns a URL (e.g. `eager[0].secure_url` for the .avif).
3. **Supabase:** Store **only the URL** in `pet_portraits.image_url` — the .avif URL from Cloudinary. Do **not** upload the image bytes to Supabase Storage for the display image; that keeps storage small and lets you use .avif everywhere.

So the pipeline is:

```
GEMINI → [Name tag overlay if theme_has_nametag] → Cloudinary (upload + eager .avif) → receive-n8n-image (body.image_url = Cloudinary .avif URL) → Supabase (save URL in pet_portraits.image_url)
```

**Why this order**

- **One place for display asset:** Cloudinary holds the .avif (and optionally original). Supabase holds the row with `image_url` pointing at Cloudinary. No duplicate storage for the same display image.
- **Gallery and purchase:** Use `pet_portraits.image_url` (the .avif) everywhere — create result, gallery, and “proceed with purchase”. Fast loading and consistent quality.
- **Upscale after payment:** When the user pays, you trigger an upscale job. Input can be the **original** asset from Cloudinary (you can keep the original upload and use it for upscale), or a separate “original” URL if you store it. When upscale completes, store the **high-res URL** (e.g. in `pet_portraits` or a downloads table). User downloads that from the downloads page; in the UI and in emails you keep using the .avif as the preview/thumbnail so everything stays light.

**Alternative (if you prefer Supabase to hold the file):**  
Gemini → Cloudinary (convert to .avif only, get bytes or URL) → n8n fetches the .avif → receive-n8n-image receives it (e.g. `image_url` or base64) and uploads to Supabase Storage, then saves that Supabase URL. That way all files sit in Supabase but you add a download step and more moving parts. **Recommendation:** store the Cloudinary .avif URL in Supabase and use it everywhere for display; only add Supabase (or another store) for the **upscaled** file when you need a dedicated “download” asset.

---

## 1. Display .avif after Gemini (proceed with purchase)

- **Flow:** GEMINI → [name tag if needed] → Cloudinary (upload + eager .avif) → callback to **receive-n8n-image** with `image_url` = Cloudinary .avif URL.
- **receive-n8n-image:** When `body.image_url` is the **final** display URL (e.g. Cloudinary .avif), you can **skip uploading to Supabase Storage** and only update/insert the row with `image_url: body.image_url`. The current implementation downloads from `image_url` and re-uploads to Storage; an optional change is to detect “external display URL” (e.g. Cloudinary) and store it directly so the .avif URL is what you show everywhere.
- **Site:** Show that URL in the create result and in the purchase step. User sees the .avif and decides to proceed with purchase.

(If you still want a copy in Supabase Storage for other reasons, you can keep the current “download from URL and upload to Storage” behaviour; the important part is that the URL you **store and show** is the .avif one.)

---

## 2. .avif in the gallery

- **Gallery:** List portraits using `pet_portraits.image_url`. If that column holds the Cloudinary .avif URL, every gallery image is .avif and loading is much lighter than with large JPEGs/PNGs.
- No extra step needed: same URL, same format everywhere.

---

## 3. After payment: upscale and downloads

- **After payment:** Trigger your upscale workflow (e.g. send the **original** image URL from Cloudinary, or the Gemini output if you still have it). When the upscale job completes, store the **high-res result URL** (e.g. in `pet_portraits.high_res_url` or a `downloads` table).
- **Downloads page:** For each item, show the **.avif** as the preview/thumbnail (same `image_url` or a dedicated thumb URL) and offer a **Download** button for the high-res file.
- **Emails:** Use the .avif URL in transactional emails (e.g. “Your portrait is ready”) so emails stay light; link “Download” to the high-res URL.

---

## Frontend behaviour

The frontend does **not** need to be updated to “pull .avif” explicitly. It already uses `image_url` everywhere:

- **Create result** – Polls `pet_portraits` and sets `resultImageUrl` from `row.image_url`; portrait-preview API returns the image at `image_url`. So once the API stores the Cloudinary .avif in `image_url`, the create page shows .avif automatically.
- **Gallery** – Uses `row.image_url` for each portrait `src`. New portraits will show .avif.
- **portrait-preview API** – Fetches `image_url` and streams it; when that URL is Cloudinary .avif, the browser gets .avif.

The **.jpg (original)** is stored in `pet_portraits.original_image_url`. The frontend does **not** display it; it is used only when you implement the upscaler or 4K download (e.g. in the orders/fulfilment flow, look up the portrait by id and pass `original_image_url` to the upscale service or as the high-res download source).

---

## Summary

| Stage              | What to do |
|--------------------|------------|
| After Gemini       | Send image to Cloudinary → get .avif (eager) → send that URL to receive-n8n-image. |
| Supabase           | Store Cloudinary .avif URL in `pet_portraits.image_url` (no need to upload display image to Storage). |
| Gallery & purchase | Use `image_url` everywhere → .avif, fast loading. |
| After payment      | Upscale using `original_image_url` (JPEG/PNG); save high-res URL for download. |
| Downloads / emails | Display = .avif (`image_url`); download = high-res (from upscale of `original_image_url`). |

So: **Gemini → .avif (Cloudinary) → Supabase (URL only)** is the recommended workflow; use the same .avif for display and thumbnails, and reserve the upscaled file for the actual download and optional emails.
