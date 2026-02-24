# n8n: CONVERTER node setup (Gemini → Cloudinary .avif)

This node uploads the GEMINI-generated image to Cloudinary and requests an **.avif** version. The .avif URL is then sent to **receive-n8n-image** so the site stores and displays the lightweight image everywhere (gallery, purchase step, emails).

---

## What you need before starting

1. **Cloudinary account** (free tier is enough).
2. **Cloudinary API credentials:** Dashboard → **Settings** → **API Keys**  
   - **Cloud name** (e.g. `your-cloud-name`)  
   - **API Key** (number)  
   - **API Secret** (click “Reveal” — keep it secret)
3. **n8n credential:** Create a **Basic Auth** credential in n8n (Settings → Credentials) with **User** = Cloudinary API Key, **Password** = Cloudinary API Secret.
4. Your workflow already has **GEMINI** producing an image (and optionally a **Name Tag** node after it). The CONVERTER node goes **after** GEMINI (or after Name Tag if you use it).

---

## CONVERTER node: copy-paste setup

Add an **HTTP Request** node and configure it as follows.

| Setting | Value |
|--------|--------|
| **Name** | `CONVERTER` (or `Cloudinary AVIF`) |
| **Method** | `POST` |
| **URL** | `https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/image/upload`  
| | ← Replace **YOUR_CLOUD_NAME** with your Cloud name from the Cloudinary dashboard. |
| **Authentication** | **Basic Auth** → select the credential where User = API Key, Password = API Secret. |
| **Send Body** | Yes |
| **Body Content Type** | **Form-Data** (or Multipart form) |

**Form fields:**

| Name | Value (use Expression mode where needed) |
|------|------------------------------------------|
| `file` | `data:image/jpeg;base64,{{ $('GEMINI').item.json.candidates[0].content.parts[0].inlineData.data }}` |
| `eager` | `f_avif,q_auto` |

- **Why `$('GEMINI')`?** So the image is always taken from the GEMINI node in this run. If you have a **Name Tag** node before CONVERTER, and the flow is GEMINI → Name Tag → CONVERTER, then the image coming into CONVERTER might be from Name Tag’s response (a URL). In that case you have two options:  
  - **Option A:** Keep CONVERTER reading from GEMINI (upload the original portrait again and get .avif only).  
  - **Option B:** Change CONVERTER to use the **Name Tag** output: Cloudinary can accept a URL with the `file` parameter set to that URL, and still apply `eager=f_avif,q_auto`. So `file` would be `{{ $('Name Tag').item.json.secure_url }}` (or the path to the URL in the Name Tag response).  
  For a **single CONVERTER for all paths**, keep **Option A** (always use GEMINI as the image source) so one node works with or without Name Tag.
- **eager:** `f_avif,q_auto` asks Cloudinary to generate an .avif with automatic quality. You can use `f_avif` only if you prefer no quality adjustment.

**Auth:** Eager transformations require **signed** uploads. Use Basic Auth (API Key + Secret) on this node; do not leave it unsigned.

---

## Where to place CONVERTER in the flow

- **Without name tag:**  
  `GEMINI` → **CONVERTER** → node that calls **receive-n8n-image**.
- **With name tag (e.g. fireman):**  
  `GEMINI` → **IF** (theme needs nametag?) → **True:** Name Tag → **CONVERTER** → receive-n8n-image.  
  **False:** **CONVERTER** → receive-n8n-image.  

So CONVERTER runs for every portrait; only the name-tag overlay is conditional. If you prefer to convert only once (after name tag when applicable), you can instead do:  
**True:** Name Tag → CONVERTER (using Name Tag URL as input per Option B above) → receive-n8n-image.  
**False:** CONVERTER (using GEMINI as input) → receive-n8n-image.

---

## After CONVERTER: call receive-n8n-image

The next node should **POST** to your **receive-n8n-image** API with the **.avif URL** from Cloudinary.

Cloudinary’s upload response includes an **eager** array. The .avif URL is in the first eager result:

- **Path in response:** `eager[0].secure_url`

**Example body for the HTTP Request node that calls receive-n8n-image:**

```json
{
  "image_url": "{{ $('CONVERTER').item.json.eager[0].secure_url }}",
  "pet_name": "{{ $('Webhook').item.json.body.pet_name }}",
  "name": "{{ $('Webhook').item.json.body.pet_name }}",
  "original_image_url": "{{ $('CONVERTER').item.json.secure_url }}",
  "showcase_consent": "{{ $('Webhook').item.json.body.showcase_consent }}",
  "status": "completed"
}
```

- Use your real receive-n8n-image URL and add **X-Webhook-Secret** (or **Authorization**) if you use it.
- **image_url** must be the .avif URL: `$('CONVERTER').item.json.eager[0].secure_url`.
- **original_image_url** must be the original (e.g. .jpg) URL: `$('CONVERTER').item.json.secure_url`. The API stores this in `pet_portraits.original_image_url` (used for 4K upscaling / high-res download). If you don’t send it, the .avif is stored but the original is not.

Then the app and gallery will use this .avif URL for display and the purchase step.

**If the .avif is stored but the original (.jpg) is not:** The API only stores the .jpg when you send **original_image_url** in the POST body. In the node that calls receive-n8n-image:

1. Open that node (HTTP Request / Supabase / “callback” to your app).
2. Find the **Body** or **JSON body** that is sent to receive-n8n-image.
3. Add or fix a field **original_image_url** (Expression mode):  
   `{{ $('CONVERTER').item.json.secure_url }}`  
   The CONVERTER node’s response has `secure_url` = original upload (.jpg) and `eager[0].secure_url` = .avif. Both must be in the body.
4. Save the workflow and run again. The API response will include `"original_image_url_stored": true` when the .jpg was received and stored.

---

## Supabase (HTTP) node: line-by-line setup (both .avif + .jpg)

Use this for the node that calls receive-n8n-image (your “Supabase (HTTP)” node). It must be an **HTTP Request** node, not the built-in Supabase database node.

### 1. Basic request

| Step | Field / setting | Value |
|------|-----------------|--------|
| 1 | **Method** | `POST` |
| 2 | **URL** | Your receive-n8n-image URL, e.g. `https://yoursite.netlify.app/api/receive-n8n-image` |
| 3 | **Send Body** | Yes (on) |
| 4 | **Body Content Type** | `JSON` |

### 2. Headers (if you use a webhook secret)

| Step | Name | Value |
|------|------|--------|
| 5 | **Header name** | `X-Webhook-Secret` (or `Authorization`) |
| 6 | **Header value** | Your secret (e.g. from n8n credentials or env) |

### 3. Body (JSON) – each line

Set the request body to **JSON** and use **Expression** for every value below (so n8n evaluates `{{ ... }}`). Replace node names if yours differ (e.g. `CONVERTER` → your Cloudinary node name, `Webhook` → your webhook node name).

| # | Body key | Value (Expression) | What it does |
|---|----------|-------------------|---------------|
| 7 | `image_url` | `{{ $('CONVERTER').item.json.eager[0].secure_url }}` | .avif URL (stored in `pet_portraits.image_url`, used for display) |
| 8 | `original_image_url` | `{{ $('CONVERTER').item.json.secure_url }}` | .jpg URL (stored in `pet_portraits.original_image_url`, used for upscaling) |
| 9 | `pet_name` | `{{ $('Webhook').item.json.body.pet_name }}` | Pet name from webhook |
| 10 | `name` | `{{ $('Webhook').item.json.body.pet_name }}` | Same as pet_name (API accepts both) |
| 11 | `showcase_consent` | `{{ $('Webhook').item.json.body.showcase_consent }}` | Gallery consent from webhook |
| 12 | `status` | `completed` | Can be fixed text |

### 4. Paste as one JSON block (if your node has one “JSON body” field)

If the node has a single **JSON** or **Specify body** field, paste this and ensure **Expression** is enabled for the field (or that the node evaluates `{{ }}`):

```json
{
  "image_url": "{{ $('CONVERTER').item.json.eager[0].secure_url }}",
  "original_image_url": "{{ $('CONVERTER').item.json.secure_url }}",
  "pet_name": "{{ $('Webhook').item.json.body.pet_name }}",
  "name": "{{ $('Webhook').item.json.body.pet_name }}",
  "showcase_consent": "{{ $('Webhook').item.json.body.showcase_consent }}",
  "status": "completed"
}
```

**Critical for .jpg:** Lines 7 and 8 must both be present. `image_url` = .avif, `original_image_url` = .jpg. If `original_image_url` is missing or wrong, the API will not store the .jpg. After a run, the API response should include `"original_image_url_stored": true`.

### Does Supabase need to be updated?

No. The app stores **two URL strings** in the same table (`pet_portraits`), not two files in Storage. The .avif and .jpg files can live on Cloudinary; Supabase only needs:

- **image_url** (column already exists) – holds the .avif URL (or display URL).
- **original_image_url** – must exist once. If your table doesn’t have it yet, run this **once** in Supabase → SQL Editor:

```sql
alter table public.pet_portraits add column if not exists original_image_url text;
```

After that, no further Supabase changes are needed. The API writes both URLs to the same row.

---

## Checklist

| Step | Check |
|------|--------|
| 1 | CONVERTER node is an HTTP Request, POST, to `https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/image/upload` |
| 2 | Authentication = Basic Auth (API Key + API Secret) |
| 3 | Body = Form-Data with `file` = data URI from GEMINI and `eager` = `f_avif,q_auto` |
| 4 | Next node sends `image_url` = `$('CONVERTER').item.json.eager[0].secure_url` to receive-n8n-image |
| 5 | Run a test; in the CONVERTER output, confirm `eager[0].secure_url` exists and opens an .avif image |

---

## Optional: keep original and .avif (two eager variants)

To store both the original and the .avif (e.g. use original for later upscale), set **eager** to a comma-separated list:

- **eager:** `f_avif,q_auto,c_limit,w_1600`  
  (or add a second transformation if your workflow needs two outputs).

For a single display URL, `f_avif,q_auto` is enough; use `eager[0].secure_url` for the site.

---

## Troubleshooting: "Could not decode base64"

If the CONVERTER node fails with **400 – Could not decode base64**, Cloudinary is receiving something that isn’t valid base64 in the `file` field.

| Cause | What to check in n8n |
|--------|------------------------|
| **Wrong source** | CONVERTER **file** must be the **GEMINI** base64, not the Supabase payload, Webhook body, or Name Tag URL. Use exactly: `data:image/jpeg;base64,{{ $('GEMINI').item.json.candidates[0].content.parts[0].inlineData.data }}` |
| **CONVERTER runs after Name Tag** | If CONVERTER runs after a Name Tag node, the **item** in CONVERTER might be from Name Tag (e.g. a URL). The expression `$('GEMINI')` still reads from the GEMINI node by name, so it should work. Confirm the **node name** is exactly `GEMINI` (case-sensitive). |
| **GEMINI structure different** | In a test run, open the **GEMINI** node output and confirm the path: `item.json.candidates[0].content.parts[0].inlineData.data` exists and is a base64 string. If your model or node version uses a different path (e.g. `parts[1]` or different key), update the expression to that path. |
| **Empty / undefined** | If the expression resolves to nothing, you get `data:image/jpeg;base64,` or `...base64,undefined`. Cloudinary then fails. Check that GEMINI actually produced an image in that run (no error or empty candidates). |
| **Form-Data vs raw** | Ensure Body Content Type is **Form-Data** and the field name is **file** (not in JSON body). The value must be the full data URI: `data:image/jpeg;base64,<base64 string>`. |
| **binaryDataMode: filesystem** | With n8n set to store binary on disk, the image may **not** be in `item.json.candidates...`; it can be in **binary** only. The expression then returns `undefined` and Cloudinary gets invalid base64. Use **Fix A** or **Fix B** below. |

### Fix A: Send the image as a binary file (when GEMINI is directly before CONVERTER)

If the flow is **GEMINI → CONVERTER** (no Name Tag in between), you can avoid base64 and send the file from n8n’s binary data:

1. Open **CONVERTER** → Body → Form-Data.
2. Add/keep field **name** = `file`.
3. For **value**, do **not** use the base64 expression. Use the option that lets you attach **binary data** (e.g. “Binary” or “From previous node”).
4. Set the **binary property** to the name your GEMINI node gives the image (often `data`).  
   So CONVERTER sends the file from the **input item’s** binary (the item from GEMINI).

Cloudinary accepts multipart file uploads, so this works. The input to CONVERTER must be the item that still has the binary (so GEMINI must be connected directly to CONVERTER for this path).

### Fix B: Code node to always output base64 (works with Name Tag and filesystem mode)

When the expression returns nothing (e.g. **binaryDataMode: filesystem**) or Cloudinary still says “could not decode base64”, use a **Code** node so the image is read from GEMINI (binary or JSON) and sent in the format Cloudinary expects.

1. Add a **Code** node **after** GEMINI (or after Name Tag). Connect: GEMINI → … → **Code** → CONVERTER.
2. In the Code node, paste this (it reads from binary first, then JSON; it outputs both a raw data URI and a **URL-encoded** one — Cloudinary often expects the form `file` value to be URL-encoded when using a data URI):

```javascript
const geminiItem = $('GEMINI').item;
let base64 = null;

// Prefer binary (used when binaryDataMode is filesystem)
if (geminiItem.binary?.data?.data) {
  base64 = geminiItem.binary.data.data;
} else if (geminiItem.json?.candidates?.[0]?.content?.parts) {
  const parts = geminiItem.json.candidates[0].content.parts;
  const imagePart = parts.find(p => p.inlineData?.data) || parts[0];
  base64 = imagePart?.inlineData?.data ?? null;
}

if (!base64 || typeof base64 !== 'string') {
  throw new Error('No image data found in GEMINI output');
}

const dataUri = 'data:image/jpeg;base64,' + base64;
// Cloudinary may require the data URI to be URL-encoded in form-data
const fileValue = encodeURIComponent(dataUri);

return {
  json: {
    fileDataUri: dataUri,
    fileEncoded: fileValue
  }
};
```

3. In **CONVERTER**, Form-Data **file** (Expression), try in this order:
   - First: `{{ $('Code').item.json.fileEncoded }}`  
   - If Cloudinary still fails: `{{ $('Code').item.json.fileDataUri }}`  
   (Replace `'Code'` with the actual name of your Code node.)

This fixes (a) image not in JSON (filesystem binary), (b) image in a different `parts` index, and (c) “could not decode base64” when the form value must be URL-encoded.

---

**Quick fix (when image is in JSON):** In CONVERTER → Body / Form-Data, set **file** to:

`data:image/jpeg;base64,{{ $('GEMINI').item.json.candidates[0].content.parts[0].inlineData.data }}`

and ensure no other node’s output (Supabase payload, Webhook, etc.) is wired into the `file` parameter.
