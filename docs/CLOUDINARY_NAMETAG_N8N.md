# Cloudinary name-tag overlay in n8n (Fluffyfriends)

This doc describes how to add a **text layer (name tag)** to selected portraits (e.g. fireman suit) using **Cloudinary**, and how to wire it into your existing **Fluffyfriends-12** n8n workflow. The pet name is taken from the webhook body and sent in the Cloudinary request.

---

## 1. Current flow (Fluffyfriends-12)

1. **Webhook** → receives `body.theme`, `body.pet_name`, `body.test_image`, `body.prompt`, etc.
2. **Fetch Theme Image** + **User image** → fetch theme + user image.
3. **Extract theme** + **Extract user image** → binary → base64 (e.g. `data`).
4. **Validate Subject** (Gemini Flash) → single-pet check.
5. **If** invalid → **Image reject** → POST to receive-n8n-image with `rejected: true`.
6. **If** valid → **Merge** → **Edit Fields1** → **GEMINI** (Gemini Pro Image) → **Convert to File** → **Supabase** (POST receive-n8n-image with `image_base64`, `pet_name`, …).

Your app’s **receive-n8n-image** API already accepts:
- `image_base64`, or
- `image_url` (it fetches the image and uploads to Supabase).

So you can either keep sending base64, or send a **Cloudinary URL** after adding the name tag.

---

## 2. Recommended flow with Cloudinary

- **Only for themes that should have a name tag** (e.g. `fireman`): after GEMINI, send the generated image to Cloudinary with an **eager transformation** that overlays the pet name as text; then send the **resulting image URL** to receive-n8n-image.
- **For other themes**: keep the current path (Convert to File → Supabase with `image_base64`).

High level:

- **GEMINI** → (same as now) output image in `candidates[0].content.parts[0].inlineData.data` (base64).
- **IF “theme needs nametag”** (e.g. `theme === 'fireman'`):
  - **Cloudinary Upload** (POST) with:
    - `file`: `data:image/jpeg;base64,{{ base64 }}`
    - `eager`: transformation string that adds text overlay with **pet name** (e.g. name tag on chest).
  - Use the **eager result URL** from Cloudinary (the image with text already applied).
  - **Supabase** = POST to receive-n8n-image with `image_url: <eager_secure_url>`, `pet_name`, `original_image_url`, `showcase_consent`, etc. (no `image_base64`).
- **ELSE** (no nametag):
  - **Convert to File** → **Supabase** with `image_base64` as today.

So: base64 goes to Cloudinary only when you want the name tag; Cloudinary returns a single image URL (with overlay); that URL is what you send in the JSON to your API.

---

## 3. Cloudinary Upload API (what n8n will call)

- **Endpoint:** `POST https://api.cloudinary.com/v1_1/<CLOUD_NAME>/image/upload`
- **Auth:** Basic Auth with **API Key** (user) and **API Secret** (password). No signature needed when using Basic Auth.
- **Body:** form-urlencoded or multipart:
  - `file`: the image. For n8n, use the **Data URI** form:  
    `data:image/jpeg;base64,<BASE64>`  
    where `<BASE64>` is the raw base64 from GEMINI (e.g. `$('GEMINI').item.json.candidates[0].content.parts[0].inlineData.data`).
  - `eager`: **one** transformation string that adds the text overlay and applies it. See below.

### 3.1 Eager transformation (text overlay = name tag)

Cloudinary uses a **text overlay** of the form:

- In URL/parameter form:  
  `l_text:<font_style>:<text>/fl_layer_apply,<placement>`

Example with placement for a “name tag on chest” (centered, slightly above bottom):

- Font/size: e.g. Arial, 60px.
- Text: **pet name** from webhook (must be safe in the parameter; see below).
- Placement: e.g. south, a bit above bottom so it sits on the suit tag area.

**Suggested eager string (single transformation):**

```text
l_text:Arial_60_bold:{{PET_NAME}}/fl_layer_apply,g_south,y_0.08
```

- `Arial_60_bold`: font family, size, weight (adjust to match your fireman style).
- `{{PET_NAME}}`: replace in n8n with the actual pet name from the webhook.
- `g_south`: anchor at bottom center.
- `y_0.08`: move overlay up by 8% of image height (so it sits on the chest/tag area).

**Important (pet name in JSON / URL):**

- The value you send in the JSON to Cloudinary is the **eager** parameter. Any special characters in the pet name (spaces, apostrophes, etc.) should be **URL-encoded** in that string so the request is valid and Cloudinary parses it correctly.
- In n8n, build the eager string and **encode only the text part** (the pet name), e.g. with an expression that uses the webhook body and encoding (e.g. `encodeURIComponent($('Webhook').item.json.body.pet_name || 'Pet')`). Then the full eager might look like:
  - `l_text:Arial_60_bold:MY%20PET/fl_layer_apply,g_south,y_0.08`
- Do **not** put raw user input with `"` or `\` or newlines directly into the string; use the encoded value so the JSON and the Cloudinary parameter stay valid.

### 3.2 Response and which URL to send to your API

- Cloudinary responds with JSON. When you use **eager**, the response includes an **eager** array; the first derived image (with the text overlay) has `secure_url` (and `url`).
- Use that **secure_url** as `image_url` in the body of the POST to **receive-n8n-image**. Your API will fetch that URL and upload the image to Supabase, so the rest of your app stays unchanged.

---

## 4. n8n workflow changes (step-by-step)

Using your **latest JSON workflow** (Fluffyfriends-12) as reference:

1. **After GEMINI, before Convert to File**
   - Add an **IF** node that checks whether the current theme should get the name tag, e.g.:
     - Condition: `theme` (from Webhook body) equals `fireman` (or is in a list like `['fireman']`).
   - **True branch (theme needs nametag):**
     - **HTTP Request (Cloudinary Upload):**
       - Method: POST.
       - URL: `https://api.cloudinary.com/v1_1/<YOUR_CLOUD_NAME>/image/upload`
       - Authentication: Generic Credential Type, User = API Key, Password = API Secret.
       - Body: form-data (or form-urlencoded, depending on n8n version):
         - `file`: `data:image/jpeg;base64,{{ $('GEMINI').item.json.candidates[0].content.parts[0].inlineData.data }}`
         - `eager`: build in an expression, e.g.  
           `l_text:Arial_60_bold:{{ encodeURIComponent($('Webhook').item.json.body.pet_name || 'Pet') }}/fl_layer_apply,g_south,y_0.08`
       - (Optional) `public_id`: e.g. `fluffyfriends/{{ $runIndex }}-{{ $now.format('yyyyMMddHHmmss') }}` so you can trace uploads.
     - From Cloudinary’s response, take `eager[0].secure_url` (or the first eager entry that has your text overlay).
     - **HTTP Request (Supabase / receive-n8n-image):**
       - Same URL and headers as your current “Supabase” node (X-Webhook-Secret, etc.).
       - Body (JSON):  
         `image_url`: `{{ $('Cloudinary Upload').item.json.eager[0].secure_url }}`,  
         `pet_name`, `original_image_url`, `status`, `showcase_consent` from Webhook/previous nodes (no `image_base64`).
   - **False branch (no nametag):**
     - Keep existing flow: **Convert to File** → **Supabase** with `image_base64` as in Fluffyfriends-12.

2. **Pet name in the JSON command**
   - The “JSON command” that includes the pet name is the **eager** parameter in the Cloudinary request. So the “request to Cloudinary” is the single POST above; the “pet name” is sent inside the **eager** string as the text overlay content (URL-encoded). No separate JSON “command” is required beyond that.

3. **Themes that use the name tag**
   - Start with `fireman`; you can add more theme IDs to the IF condition (e.g. an array and “theme in array”) when you add more name-tag styles later.

---

## 5. Summary

- **Base64 path (no nametag):** GEMINI → Convert to File → Supabase (image_base64) — unchanged.
- **Nametag path (e.g. fireman):** GEMINI → Cloudinary Upload (file = base64 Data URI, eager = text overlay with **pet name** from webhook, URL-encoded) → Supabase with **image_url** = Cloudinary eager `secure_url`.
- Pet name is included in the Cloudinary request **only** in the **eager** parameter, as the text of the overlay; your app already has receive-n8n-image supporting **image_url**, so no backend code change is required.

If you share your exact theme IDs and desired name-tag position (e.g. “fireman only, bottom center”), the same pattern can be applied to other themes by extending the IF condition and optionally using different `eager` placements (e.g. different `y_` or gravity) per theme.
