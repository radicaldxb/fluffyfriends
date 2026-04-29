# Architecture log (FluffyFriends)

## Brief 21 — Cloudinary download URLs (`landscape_url`, `portrait_url`)

- **`pet_portraits.landscape_url`** and **`pet_portraits.portrait_url`** store Cloudinary delivery URLs (often `.jpg` suffix; CDN may still negotiate AVIF in the browser for bare GETs).
- **Display** (thumbnails, previews): use normal URLs / `getDisplayUrl()` as today; AVIF/WebP in modern browsers is acceptable.
- **Download** (anything that should save a print-ready file): always pass the URL through **`getDownloadUrl()`** in `lib/cloudinary.ts`, which injects `fl_attachment,f_jpg,q_auto:best` after `/image/upload/` so the response is a **forced JPEG** with **attachment** disposition. US print kiosks expect JPG, not AVIF.
- **Consumers in app:** `/my-portraits` download buttons; `/checkout/success` download buttons (links populated when both URLs exist after WF3). Email and n8n flows that deep-link users to `/preview/[id]` or similar are unchanged; **do not** use raw Cloudinary URLs in customer emails unless they go through **`getDownloadUrl()`** behavior on the eventual download link.
