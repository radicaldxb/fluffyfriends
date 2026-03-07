# Go-live: Download links on My Portraits

## Why download links can be missing

The **My Portraits** page shows "Download wide" and "Download tall" only when the database has **real URLs** in `pet_portraits.landscape_url` and `pet_portraits.portrait_url`. Those columns are updated by **n8n WF3 (upscale-and-email)**.

If WF3 writes **template literals** (e.g. `{{ $json.landscape_url }}`) instead of the actual file URLs, the app correctly hides the buttons and shows a message so users don’t get broken links. To have working download links when you go live, WF3 must write the **resolved URLs**.

## What to fix in n8n (WF3)

1. **Find the step** in WF3 that updates Supabase `pet_portraits` (or that builds the payload for an HTTP request that updates the row).
2. **Set `landscape_url` and `portrait_url`** to the **actual URLs** returned by the step that uploads or stores the upscaled files (e.g. Cloudinary/S3 node output), not to the literal string `{{ $json.landscape_url }}`.
3. In n8n, use the **output of the node** that holds the file URL, e.g.:
   - `{{ $json.secure_url }}` (if that node outputs `secure_url`), or  
   - `{{ $node["Upload Landscape"].json.secure_url }}` (if you need to reference another node by name).
4. **Test**: Run one order through the full flow, then in Supabase check `pet_portraits` for that portrait: `landscape_url` and `portrait_url` should start with `https://` and open as images. If they contain `{{` or `$json` as text, the workflow is still writing expressions instead of values.

## App behaviour (no code change needed for this)

- The app only shows download buttons when both URLs pass validation (real `https` URLs, no `{{` or `$json` in the string).
- When links are missing, the page shows: check your email, and a **contact support** link so users can request the files. Support can send the links manually until WF3 is fixed.

## Quick check before go-live

Run a test order and then in Supabase:

```sql
SELECT id, landscape_url, portrait_url
FROM pet_portraits
WHERE status = 'completed'
ORDER BY created_at DESC
LIMIT 3;
```

- **Good:** `landscape_url` and `portrait_url` are full `https://...` URLs.
- **Bad:** They contain `{{` or look like `{{ $json.landscape_url }}` — fix WF3 as above.
