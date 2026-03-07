# WF3: Store download URLs so My Portraits can show them

The upscale-and-email workflow (WF3) sends the print-ready download links in the email. To show those same links on the **My Portraits** page, the workflow must also write them to the database.

## Endpoint

**POST** `/api/set-portrait-download-urls`

- **Body (JSON):** `portrait_id`, `landscape_url`, `portrait_url` (at least one URL required).
- **Auth:** If `N8N_WEBHOOK_SECRET` is set in Netlify, send it in the `X-Webhook-Secret` header or `Authorization: Bearer <secret>` (same as for `/api/receive-n8n-image`).

Example body:

```json
{
  "portrait_id": "uuid-from-your-workflow",
  "landscape_url": "https://...",
  "portrait_url": "https://..."
}
```

## In n8n

Add an **HTTP Request** node (or similar) that runs **after** you have the final download URLs and **before or after** sending the email:

1. **URL:** `https://your-site.netlify.app/api/set-portrait-download-urls` (or your production URL).
2. **Method:** POST.
3. **Body:** JSON with `portrait_id`, `landscape_url`, `portrait_url` — use the same values you use for the email links (e.g. from the same node that builds the email).
4. **Headers:** If you use `N8N_WEBHOOK_SECRET`, add `X-Webhook-Secret` (or `Authorization: Bearer <secret>`) with the same value as in Netlify.

Once this node runs successfully, the portrait row in `pet_portraits` has `landscape_url` and `portrait_url` set, and **My Portraits** will show the preview and download buttons for that portrait.
