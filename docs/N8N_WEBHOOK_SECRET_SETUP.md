# n8n: Sending the Webhook Secret to receive-n8n-image

When you set `N8N_WEBHOOK_SECRET` in Netlify, the `/api/receive-n8n-image` endpoint requires that secret on every request. n8n must send it in a header.

---

## Step 1: Add the Secret in Netlify

1. In Netlify → Site settings → Environment variables, add:
   - **Key:** `N8N_WEBHOOK_SECRET`
   - **Value:** A long random string (e.g. generate with `openssl rand -hex 24`)
2. Trigger a new deploy so the variable is available.

---

## Step 2: Add the Header in n8n

In your **transform-pet** workflow, open the node that POSTs to your app (the one that calls `https://your-site.netlify.app/api/receive-n8n-image` — often named "Supabase" or "Receive callback").

1. In that **HTTP Request** node, find **Headers** (or **Options** → **Headers**).
2. Add a header:
   - **Name:** `X-Webhook-Secret`
   - **Value:** The same value you set for `N8N_WEBHOOK_SECRET` in Netlify.

If your n8n instance supports **credentials** or **environment variables**, you can store the secret there and reference it (e.g. `{{ $env.N8N_WEBHOOK_SECRET }}`) so you don’t paste it in plain text. Otherwise, paste the value directly.

**Alternative:** You can send the secret as a Bearer token instead:
- **Name:** `Authorization`
- **Value:** `Bearer YOUR_SECRET_HERE` (same value as `N8N_WEBHOOK_SECRET`)

---

## Step 3: Save and Activate

1. Save the workflow.
2. Ensure the workflow is **Active** (production).
3. Run a test: create a portrait from your site. If the secret matches, the callback succeeds; if not, you’ll get **401 Unauthorized** from `/api/receive-n8n-image` and the portrait won’t appear.

---

## Troubleshooting

**401 Unauthorized from receive-n8n-image**
- Secret in n8n must **exactly** match `N8N_WEBHOOK_SECRET` in Netlify (no extra spaces, same casing).
- Header name must be `X-Webhook-Secret` (or use `Authorization: Bearer <secret>`).
- Redeploy Netlify after changing the env var.

**Callback worked before, 401 after adding secret**
- You added `N8N_WEBHOOK_SECRET` in Netlify but didn’t add the header in n8n. Add the header as above.

**I don’t want to use a secret**
- Leave `N8N_WEBHOOK_SECRET` unset in Netlify. The callback will accept all requests (less secure; anyone with the URL could POST fake data).
