# Fluffyfriends-15.json workflow review

Review of your **Fluffyfriends-Nametag+upscaler** n8n workflow (Fluffyfriends-15.json). The overall flow (Webhook → validate → merge → GEMINI → Cloudinary → Supabase) makes sense; a few fixes are needed so CONVERTER and the callback work as intended.

---

## What works

- **Webhook** → Fetch Theme Image + User image in parallel.
- **Validate Subject** (Gemini 3 Flash) → **If** (VALID: no → Image reject, else → Merge).
- **Merge** → Edit Fields1 (prompt + refined prompt) → **GEMINI** (image generation).
- **CONVERTER** uses Cloudinary upload URL and Basic Auth; **eager** is `f_avif,q_auto`.
- **Supabase** node has the right receive-n8n-image URL and X-Webhook-Secret.

---

## Fix 1: CONVERTER `file` parameter is wrong

In your export, the CONVERTER node’s **`file`** body parameter is set to the **Supabase callback JSON** (image_url, pet_name, original_image_url, etc.). Cloudinary expects the **image data**, not that JSON.

**Correct CONVERTER form fields:**

| Name   | Value |
|--------|--------|
| `file` | `data:image/jpeg;base64,{{ $('GEMINI').item.json.candidates[0].content.parts[0].inlineData.data }}` |
| `eager`| `f_avif,q_auto` |

- In n8n: open **CONVERTER** → Body Parameters (or Form-Data).
- Set **file** to the expression above (GEMINI base64 as a data URI). Do **not** put the Supabase payload in `file`.

---

## Fix 2: Only one path into Supabase (use CONVERTER only)

Right now **GEMINI** goes to both **Convert to File** and **CONVERTER**, and both then go to **Supabase**. So:

- Two executions hit receive-n8n-image (once with Convert to File output, once with CONVERTER output).
- The Supabase node body is built for the old path (image_base64 from GEMINI), so even when triggered by CONVERTER you still send base64 and the .avif URL is never used.

**Recommended:** use a single path and store .avif + original URL only.

1. **Remove** the connection **GEMINI → Convert to File** (and the connection Convert to File → Supabase). You can leave the “Convert to File” node in the canvas but disconnect it so it never runs.
2. **Keep** **GEMINI → CONVERTER → Supabase** as the only success path.
3. **Change the Supabase node body** so it sends the Cloudinary URLs (for when the input is from CONVERTER).

---

## Fix 3: Supabase node body when input is from CONVERTER

The node that calls receive-n8n-image must send **image_url** (avif) and **original_image_url** (original) from CONVERTER, and no **image_base64**, so the API stores the Cloudinary URLs and does not re-upload.

**Use this body for the Supabase node** (the one that receives from CONVERTER):

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

- **image_url** = .avif (preview everywhere).
- **original_image_url** = original JPEG/PNG (for upscaling).
- Get **pet_name** and **showcase_consent** from **Webhook** by name, as above.

Remove **image_base64** and **original_image_url** from the Webhook/test_image; the only source for image URLs should be CONVERTER.

---

## Flow after changes

1. Webhook → Fetch Theme Image + User image.
2. Extract user image → Validate Subject → If.
3. If invalid → Image reject (receive-n8n-image with `rejected: true`).
4. If valid → Merge (theme + user image) → Edit Fields1 → GEMINI.
5. GEMINI → **CONVERTER** (upload to Cloudinary with eager `f_avif,q_auto`).
6. CONVERTER → **Supabase** (receive-n8n-image with `image_url` = .avif, `original_image_url` = original).

Result: one callback per portrait; site uses .avif for preview; original URL is stored for upscaling.

---

## Security note

The workflow JSON contains:

- **X-Webhook-Secret** value in the Supabase and Image reject nodes.
- **API key** placeholders `****` in GEMINI and Validate Subject URLs.

Do not commit the real secret or keys to git. Use n8n credentials and environment variables where possible, and keep this file (or any export with secrets) out of version control.

---

## Checklist

| Item | Action |
|------|--------|
| CONVERTER `file` | Set to `data:image/jpeg;base64,{{ $('GEMINI').item.json.candidates[0].content.parts[0].inlineData.data }}` |
| CONVERTER `eager` | Keep `f_avif,q_auto` |
| Path to Supabase | Only CONVERTER → Supabase; disconnect Convert to File from GEMINI and from Supabase |
| Supabase node body | Use the JSON above (image_url + original_image_url from CONVERTER, rest from Webhook) |

After these changes, the workflow matches the intended design: .avif for all previews, original JPEG/PNG stored for upscaling.
