# n8n Workflow Setup Guide

**Testing:** Use your **deployed Netlify site** (e.g. `https://fluffyfriends-dev.netlify.app/create` or `/test-n8n`) to test. The app always calls `N8N_WEBHOOK_URL` directly from the server; testing on Netlify keeps things simple.

## Reference workflow (do not break)

**Stored working export:** [`docs/n8n-fluffyfriends-working.json`](./n8n-fluffyfriends-working.json)

This is the known-good n8n workflow that works with the FluffyFriends app. When changing the flow, import or compare against this file so the webhook → GEMINI → Supabase/Next.js pipeline stays intact.

---

### Diagnostic webhook (ping test)

To check whether the app can reach n8n at all (without running the full portrait flow):

1. **Import the diagnostic workflow:** [`docs/n8n-diagnostic-webhook.json`](./n8n-diagnostic-webhook.json) — one Webhook node, path `diagnostic-ping`, responds immediately.
2. **In n8n:** Import it, **activate** it, and copy its **Production** webhook URL (e.g. `https://n8n.srv943460.hstgr.cloud/webhook/diagnostic-ping`).
3. **Set that URL** in Netlify (or `.env.local`) as `N8N_WEBHOOK_URL` and redeploy if needed.
4. **Open** your site's **/test-n8n** page and click **"Ping webhook"**. You should see **OK: Yes**, a **response time (ms)**, and status 200. If you see a timeout or error, the app cannot reach n8n (firewall, wrong URL, or workflow not active).
5. When done testing, set `N8N_WEBHOOK_URL` back to your main workflow URL (e.g. `.../webhook/transform-pet`).

---

## Production webhook (no manual “Execute Workflow”)

To have the app trigger n8n automatically (no need to click “Execute Workflow” every time):

1. **Activate the workflow in n8n**
   - Open the workflow in n8n.
   - Turn the **Active** toggle **on** (top right). The workflow then listens for incoming webhooks.

2. **Use the production webhook URL**
   - n8n exposes two URLs for Webhook nodes:
     - **Test URL** – only works while you are in the editor / manual run (e.g. `.../webhook-test/transform-pet`).
     - **Production URL** – works when the workflow is **Active** (e.g. `.../webhook/transform-pet`).
   - Use the **production** URL. It usually looks like:
     - `https://<your-n8n-host>/webhook/<path>`
     - e.g. `https://app.n8n.cloud/webhook/abc123-def456` or `https://n8n.yourdomain.com/webhook/transform-pet`
   - In the Webhook node, the production URL is shown when the workflow is active (or in the node’s “Production URL” / “Webhook URLs” section).

3. **Set it in Netlify**
   - In Netlify: **Site settings → Environment variables** (or Build & deploy → Environment).
   - Add or update:
     - **Key:** `N8N_WEBHOOK_URL`
     - **Value:** your **production** webhook URL (the one that works when the workflow is Active).
   - Redeploy or trigger a new deploy so the variable is applied.

After that, every time a user submits from your app (or you trigger from `/create` / test-n8n), the request goes to that URL and n8n runs the workflow without any manual “Execute Workflow”.

### Webhook “Respond” must not be “When last node finishes”

The workflow runs for a long time (fetch image, Gemini, etc.). If the Webhook node is set to **Respond: When last node finishes**, n8n keeps the HTTP connection open until the whole workflow completes. The caller (Netlify or your app) will **time out** (often after 10–26 seconds) and may never see a response, and some setups can fail or not trigger correctly.

**Change it:** In the **Webhook** node, set **Respond** to **“Immediately”** (or “When webhook is called” / “On received”). Then n8n returns a quick 200 to the caller and runs the rest of the workflow in the background. Your app already does not wait for the result (fire-and-forget); it just needs n8n to accept the request and respond quickly.

### Production webhook not triggering / “stuck in test mode”

n8n has a known UI quirk: the Webhook node often **shows** the Test URL when you open it, even when the workflow is Active. That’s just the display; production can still work. If the app gets **404** or no execution appears in n8n:

1. **Confirm the workflow is really Active**
   - Top-right toggle must be **on** (green “Active”).
   - Try: turn it **off** → **Save** → turn it **on** again. Then **close** the workflow tab (or switch to another workflow) so n8n isn’t in “editor test” mode.

2. **Use the exact production URL**
   - In the Webhook node, switch to the **Production** tab/dropdown and **copy** the URL shown there (when the workflow is Active). Some hosts use a path with an ID, e.g. `.../webhook/abc-123-def`, not just `.../webhook/transform-pet`.
   - Set that exact URL in Netlify as `N8N_WEBHOOK_URL` and redeploy.

3. **Verify with a direct POST**
   - From your machine or Postman:  
     `POST https://n8n.srv943460.hstgr.cloud/webhook/transform-pet`  
     Body (JSON): `{"test_image":"https://example.com/photo.jpg","name":"Test"}`  
   - If you get **404** or “webhook not registered”, the workflow isn’t registered for production on that path (step 1). If you get **200** and an execution in n8n, production works; then the issue is how/when the app calls the URL.

4. **Workaround when production stays stuck: use the Test URL**
   - Set `N8N_WEBHOOK_URL` to the **Test** URL (e.g. `https://n8n.srv943460.hstgr.cloud/webhook-test/transform-pet`).
   - Each run: in n8n open the workflow → click **Execute Workflow** (so it shows “Waiting for webhook…”). **Within that window** (e.g. 30–60 seconds) submit from your app (/create or test-n8n). The workflow will run. Repeat for each new portrait until production webhook works.
   - On self‑hosted n8n, production webhook registration can depend on version or host; if it never works, consider n8n Cloud or ask your host for “production webhook” support.

---

## Full flow with URL skips Gemini (image not styled)

If “Full flow with URL” or “Upload and run n8n” sends the image through but the result is the **original photo** (no style transfer), the workflow is **not** going through GEMINI. Fix it in n8n:

1. **Two branches must run from the Webhook**
   - **Branch A (pet image):** Webhook → HTTP Request → Extract from File → **Merge (input 2)**.
   - **Branch B (style image):** Webhook → Edit Fields → Download file → Master_Fireman → **Merge (input 1)**.
   - **Merge** → GEMINI → Convert to File → Supabase.

2. **Enable the style branch**
   - The nodes **Edit Fields**, **Download file**, and **Master_Fireman** must be **enabled** (not greyed out). If they are disabled, only the pet image runs and Merge/GEMINI don’t get the style image, so either the flow fails or a different path runs (e.g. direct to Supabase without Gemini).
   - Enable those nodes and ensure both branches connect into **Merge**, and Merge connects to **GEMINI**, then **Convert to File**, then **Supabase**.

3. **No direct “shortcut” to Supabase**
   - There must be **no** connection from “Extract from File” (or any node before GEMINI) straight to “Convert to File” or “Supabase”. The only path to Supabase should be: GEMINI → Convert to File → Supabase, so that only the **Gemini‑generated** image is sent to your app.

4. **Check execution in n8n**
   - After triggering from the app, open **Executions** in n8n and confirm the run goes through **Merge** → **GEMINI** → **Convert to File** → **Supabase**. If it stops earlier or takes a different route, fix the connections as above.

---

## HTTP POST Node Configuration (After Image Generation)

After your n8n workflow generates the image, configure the HTTP POST node to send it back to your app:

### Node Settings

**Method:** `POST`

**URL:** 
```
https://your-domain.com/api/receive-n8n-image
```
(For local testing: `http://localhost:3000/api/receive-n8n-image`)

**Authentication:** None (or add API key if you add auth later)

### Request Body Format

The API accepts JSON with one of these image formats:

#### Option 1: Base64 Image (Recommended)
```json
{
  "image_base64": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "pet_name": "Test Pet",
  "original_image_url": "https://example.com/original.jpg",
  "user_email": "user@example.com",
  "status": "completed"
}
```

#### Option 2: Image URL
```json
{
  "image_url": "https://your-storage.com/generated-image.jpg",
  "pet_name": "Test Pet",
  "original_image_url": "https://example.com/original.jpg"
}
```

#### Option 3: Binary Data URL
```json
{
  "image_data_url": "data:image/png;base64,iVBORw0KGgo...",
  "pet_name": "Test Pet"
}
```

### If you get "Unexpected end of JSON input" or 500 from the API

The API is receiving an **empty or invalid JSON body** from the "Supabase" (HTTP Request) node. Fix it in n8n:

1. **Send Body** – In the HTTP Request node, ensure **Send Body** is turned **on** and **Body Content Type** is **JSON**.
2. **Valid JSON** – In the JSON body, do **not** put a leading `=` in front of the whole body (n8n sometimes adds this for expressions; it can break parsing). The body must be valid JSON.
3. **Where the base64 comes from**:
   - If you read from **GEMINI** directly: use  
     `"image_base64": "{{ $('GEMINI').item.json.candidates[0].content.parts[0].inlineData.data }}"`  
     and ensure Gemini’s response actually has that path (model and response format can differ).
   - If you use **Convert to File** and put the output in a field (e.g. `data`): use  
     `"image_base64": "{{ $json.data }}"`  
     so the node that runs before this HTTP Request is the Convert to File node, and its output field name matches (e.g. `data`).
4. **Fallback for quick tests** – You can send a normal image URL instead of base64: body  
   `{"image_url": "https://example.com/photo.jpg", "pet_name": "Test Pet", "status": "completed"}`  
   so the API fetches the image and stores it (no Gemini needed).

After fixing, the API will return **400** with a clear error message if the body is still empty or invalid, instead of 500.

### n8n Node Configuration Steps

1. **Add HTTP Request node** after your image generation step
2. **Set Method** to `POST`
3. **Set URL** to your API endpoint (see above)
4. **Set Body Content Type** to `JSON`
5. **Configure Body** using n8n expressions:

#### If you have base64 image in a previous node:
```javascript
{
  "image_base64": "{{ $json.image_base64 }}",
  "pet_name": "{{ $json.pet_name }}",
  "original_image_url": "{{ $json.test_image }}",
  "status": "completed"
}
```

#### If you have binary data:
- Use a **Code** node before HTTP Request to convert binary to base64:
```javascript
const imageBuffer = Buffer.from($input.item.json.data);
const base64 = imageBuffer.toString('base64');
const mimeType = 'image/jpeg'; // or detect from your data

return [{
  json: {
    image_base64: `data:${mimeType};base64,${base64}`,
    pet_name: $input.item.json.pet_name,
    original_image_url: $input.item.json.test_image
  }
}];
```

### Required Fields

- **At least one image field:** `image_base64`, `image_url`, `image_data_url`, or `image_binary`
- **Optional:** `pet_name`, `original_image_url`, `user_email`, `status`

### Response

The API returns:
```json
{
  "success": true,
  "image_url": "https://your-supabase-url/storage/v1/object/public/images/generated/n8n-1234567890-abc123.jpg",
  "path": "generated/n8n-1234567890-abc123.jpg",
  "message": "Image stored successfully"
}
```

### Testing

1. Run your n8n workflow
2. Check the HTTP POST node response
3. Visit `/test-n8n` page - it will poll for the generated image
4. Image should appear automatically when ready

### Troubleshooting

- **400 Error:** Check that image data is properly formatted
- **500 Error:** Check Supabase Storage bucket exists and is public
- **Image not appearing:** Check that `pet_name` matches what you submitted on test page
