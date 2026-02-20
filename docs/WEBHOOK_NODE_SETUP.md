# Webhook Node Configuration

## Exact JSON Configuration

Copy this JSON for your Webhook node:

```json
{
  "parameters": {
    "httpMethod": "POST",
    "path": "transform-pet",
    "responseMode": "onReceived",
    "options": {}
  },
  "type": "n8n-nodes-base.webhook",
  "typeVersion": 2.1,
  "name": "Webhook"
}
```

## Key Settings Explained

- **`httpMethod`**: `"POST"` - Accepts POST requests
- **`path`**: `"transform-pet"` - The webhook path (must match your Netlify `N8N_WEBHOOK_URL`)
- **`responseMode`**: `"onReceived"` - Responds immediately when webhook is called (prevents timeouts)
- **`options`**: `{}` - Empty options object

## How to Apply in n8n

### Option 1: Manual Configuration (Recommended)
1. Open your workflow in n8n
2. Click the **Webhook** node
3. Set these values manually:
   - **Method**: `POST`
   - **Path**: `transform-pet`
   - **Response**: `When webhook is called` or `On received`
4. Save the workflow

### Option 2: Import/Replace Node
If you want to replace the entire node:
1. Delete the existing Webhook node
2. Add a new Webhook node
3. Configure it with the settings above
4. Reconnect it to your workflow (should connect to HTTP Request and Fetch Theme Image nodes)

## Verification

After configuring:
1. **Activate** the workflow (toggle ON)
2. Click the Webhook node → **Production** tab
3. You should see a URL like: `https://n8n.srv943460.hstgr.cloud/webhook/transform-pet`
4. Copy this URL
5. Update `N8N_WEBHOOK_URL` in Netlify to match this exact URL
6. Trigger a new deploy in Netlify

## Common Issues

**Path doesn't match:**
- If your webhook path is a UUID (like `7cb07fbe-ce9f-4a18-8ded-2bd4fcdbae56`), change it to `transform-pet`
- The path in n8n must match the path in your Netlify `N8N_WEBHOOK_URL`

**Response mode not found:**
- Some n8n versions call it "Response" dropdown
- Select "When webhook is called" or "On received"
- This is equivalent to `responseMode: "onReceived"`

**404 errors:**
- Make sure workflow is **Active** (toggle ON)
- Path must be exactly `transform-pet` (case-sensitive)
- URL in Netlify must match: `.../webhook/transform-pet`
