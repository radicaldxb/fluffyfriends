# Checkout success flow: Pay → Preview → Approve → Loader → My Portraits

This doc verifies the flow so **Pay → Preview → Approve (send email) → Loader → My Portraits with preview and download link** works end-to-end.

## 1. Pay

- **Stripe:** Checkout completes → webhook sets portrait `user_email` and `status: "generating"`, calls WF2.
- **Pack:** User clicks “Use 1 portrait” → `trigger-generation` sets portrait `user_email` and `status: "generating"`, calls WF2.

Portrait is now linked to the buyer’s email (`user_email`).

## 2. Preview

- User lands on `/checkout/success?session_id=...` (Stripe) or `?portrait=...&email=...` (pack).
- Page polls **GET /api/approve-portrait** until the portrait has `image_url` (WF2 → receive-n8n-image).
- When 200 is returned, **Step 3** shows: “Does this look like {pet}?” with preview image via `/api/portrait-preview?id=...`.

So: **Preview works** as long as WF2 finishes and receive-n8n-image updates the row with `image_url`.

## 3. Approve (send email)

- User fills form (email, name, city, country, etc.) and clicks **“Email my portraits →”**.
- Frontend sends **POST /api/approve-portrait** with `session_id` or `portrait_id`, plus email and details.
- Backend: upserts `users`, sets portrait `user_id` and `user_email`, calls **WF3** (N8N_UPSCALE_AND_EMAIL_WEBHOOK_URL), then polls DB for `landscape_url` and `portrait_url` for up to 90s, sets portrait `status: "completed"`, calls deduct-portrait, returns `{ ok: true }`.

So: **Approve works** as long as WF3 is configured and runs when we call it.

## 4. Loader

- While the POST is in flight, the success page shows **“submitting”** with the step loader (Palette → Ruler → Frame → Mail → … → Download).
- When the API returns 200 with `ok: true`, the page **redirects** to My Portraits (it does not show a separate “Step 4” screen).

So: **Loader** is the “submitting” state on the success page; then immediate redirect.

## 5. My Portraits with preview and download link

- Redirect goes to **`/my-portraits?email=...`** (email is normalized to lowercase).
- My Portraits page fetches **GET /api/my-portraits?email=...**.
- API finds portraits by:
  - `users.email` ilike ? → `user_id` → portraits with that `user_id`, or
  - `pet_portraits.user_email` ilike ? (fallback).
- Only portraits with **`status = 'completed'`** are returned (set in approve-portrait after the URL poll).
- Each portrait is shown with:
  - **Preview:** `/api/portrait-preview?id=...` or valid `landscape_url`/`portrait_url`/`image_url`.
  - **Download links:** “Download wide” / “Download tall” when `landscape_url` and `portrait_url` are real URLs in the DB.

So: **Preview on My Portraits works** because we set `user_id` + `user_email` and `status: "completed"`, and we look up by email (case-insensitive). **Download links work** only if WF3 has written the URLs to the DB.

### Requirement for download links

WF3 must write `landscape_url` and `portrait_url` to the portrait row. Options:

- **Recommended:** WF3 calls **POST /api/set-portrait-download-urls** with `portrait_id`, `landscape_url`, `portrait_url` (see [WF3_STORE_DOWNLOAD_URLS.md](./WF3_STORE_DOWNLOAD_URLS.md)).
- Or WF3 updates `pet_portraits` in Supabase directly with those columns.

If WF3 does **not** write the URLs:

- My Portraits still shows the portrait and preview (and “check again”).
- The approve-portrait API waits up to 90s for the URLs; if WF3 writes them within that window (e.g. by calling set-portrait-download-urls), the links will appear right away on My Portraits. If WF3 is slower, the user sees “Download links will appear when ready” and the page polls every 4s until the URLs appear.

## Summary

| Step   | What happens | Depends on |
|--------|----------------|------------|
| Pay    | Portrait gets `user_email`, WF2 triggered | Stripe webhook / trigger-generation |
| Preview| Success page shows portrait when `image_url` exists | WF2 + receive-n8n-image |
| Approve| Form POST → user + portrait linked, WF3 called, status → completed | WF3 URL + approve-portrait |
| Loader | Shown during POST; then redirect | Frontend |
| My Portraits | List by email, preview + download when URLs present | WF3 writing URLs via set-portrait-download-urls or Supabase |

So **yes, this will work** provided:

1. WF2 produces the preview image (receive-n8n-image updates the row).
2. WF3 is called by approve-portrait and runs (sends email).
3. WF3 writes `landscape_url` and `portrait_url` via **POST /api/set-portrait-download-urls** (or direct Supabase update) so download links appear on My Portraits (and optionally within 90s so they’re there when the user lands).
