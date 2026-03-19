# Cloudinary name tag — step-by-step (no mistakes)

Follow these steps **in order**. Do one section, check it works, then do the next.

**Name tag not showing on the image?** → See **`docs/NAMETAG_NOT_SHOWING_TROUBLESHOOTING.md`** for a step-by-step checklist (DB prompt, n8n branch, Cloudinary node, and callback).

---

## Copy-paste: Name Tag / Cloudinary Upload node

Use this when configuring the **Name Tag** (or **Cloudinary Upload**) HTTP Request node in n8n. No code from Cloudinary needed — this is the full setup.

| Setting | Value |
|--------|--------|
| **Name** | `Name Tag` or `Cloudinary Upload` |
| **Method** | `POST` |
| **URL** | `https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/image/upload` ← replace `YOUR_CLOUD_NAME` with your Cloud name from Dashboard → Settings → API Keys |
| **Authentication** | **Basic Auth** → select credential with **User** = Cloudinary API Key, **Password** = Cloudinary API Secret (create in n8n Settings → Credentials) |
| **Send Body** | Yes |
| **Body Content Type** | **Form-Data** (or Multipart form) |

**Form fields (add exactly two):**

| Name | Value (expression) |
|------|---------------------|
| `file` | `data:image/jpeg;base64,{{ $('GEMINI').item.json.candidates[0].content.parts[0].inlineData.data }}` |
| `eager` | `l_text:Arial_60_bold:{{ encodeURIComponent($('Webhook').item.json.body.pet_name || 'Pet') }}/fl_layer_apply,g_south,y_0.08` |

- **Auth is required:** without Basic Auth, Cloudinary rejects the request with "Eager parameter is not allowed when using unsigned upload".
- **Why `$('GEMINI')` and not `$json`?** Logic nodes (like IF) often pass only JSON and can drop binary or very large fields. The Name Tag node must **not** rely on the incoming item for the image. Always use **`$('GEMINI').item.json...`** so the image is read from the GEMINI node’s output for this run, not from the item that passed through the IF. See **“Binary / image data after IF”** below if the image is still missing.
- After Cloudinary responds, use `eager[0].secure_url` in the next node (POST to receive-n8n-image with `image_url`).

---

## Part A: What you need before starting

**Step A1.** You have an n8n workflow that already runs: Webhook → … → GEMINI → Convert to File → Supabase (Fluffyfriends-12 or similar).

**Step A2.** You have a **Cloudinary account** (free tier is enough).

**Step A3.** From Cloudinary Dashboard → **Settings** (gear) → **API Keys**, you have:
- **Cloud name** (e.g. `your-cloud-name`)
- **API Key** (a number)
- **API Secret** (click “Reveal” to copy it — keep it secret)

**Step A4.** Your Fluffyfriends site’s **receive-n8n-image** API is deployed and you know:
- Its URL (e.g. `https://fluffyfriends.online/api/receive-n8n-image`)
- The **X-Webhook-Secret** value you use in n8n when calling it

---

## Part B: Add the “theme needs nametag?” check

We will only add the name tag when the theme is **fireman**. All other themes keep the current path (no Cloudinary).

**Step B1.** In n8n, open your workflow. Find the **GEMINI** node. The next node is currently **Convert to File**.

**Step B2.** **Disconnect** the wire from **GEMINI** to **Convert to File** (click the connection and delete it, or drag it away). Leave both nodes in place.

**Step B3.** Add a new node: click **+** after GEMINI, search for **IF**, add **IF**.

**Step B4.** Connect **GEMINI** → **IF** (output of GEMINI goes into IF).

**Step B5.** Configure the IF node:
- **Condition 1:**  
  - Value 1: `{{ $json.body.theme }}`  
    (If your IF doesn’t have “body”, use: `{{ $('Webhook').item.json.body.theme }}`.)  
  - Operation: **equals** (or “String – equals”)  
  - Value 2: `fireman`
- Leave “Combine” as **AND** (only one condition).

**Step B6.** Save the workflow.  
**Check:** When you run a test with `theme: "fireman"`, the IF should go to **true**; with `theme: "spaceman"` it should go to **false**.

---

## Part C: False branch (no name tag) — keep current behaviour

**Step C1.** Connect the **False** output of **IF** to **Convert to File** (the node that was originally after GEMINI).

**Step C2.** Connect **Convert to File** to your existing **Supabase** node (the one that sends `image_base64` to receive-n8n-image).

**Check:** For `theme: "spaceman"` (or anything other than fireman), the flow should be: IF (false) → Convert to File → Supabase, and the portrait should appear without a name tag, as before.

---

## Part D: True branch — Cloudinary credentials in n8n

**Step D1.** In n8n, go to **Settings** (or **Credentials** in the left menu) and add a new credential.

**Step D2.** Choose **HTTP Header Auth** or **Generic Credential Type** (depending on your n8n version):
- If you have **“Basic Auth”** or **“HTTP Basic Auth”**: use that.
- **User / Username:** your Cloudinary **API Key** (the number).
- **Password:** your Cloudinary **API Secret**.

**Step D3.** Name the credential something like `Cloudinary API` and save.

---

## Part E: True branch — Cloudinary Upload node

**Step E1.** Add a new node after the **IF** node: from the **True** output of IF, add **HTTP Request** (or “Webhook” is wrong — we want “HTTP Request” to call an external API).

**Step E2.** Configure the HTTP Request node:

| Field | Value |
|--------|--------|
| **Name** | `Cloudinary Upload` |
| **Method** | POST |
| **URL** | `https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/image/upload` |
| | Replace `YOUR_CLOUD_NAME` with your real Cloud name (e.g. `dxxxxxx`). No spaces, no `https://` in the cloud name. |

**Step E3.** Authentication (required — without it, Cloudinary treats the upload as unsigned and rejects `eager`):
- **Authentication:** Predefined Credential Type → **Basic Auth** (or the one you created).
- Select the credential you created in Part D (Cloudinary API Key + Secret).
- If this is not set, you will get: "Eager parameter is not allowed when using unsigned upload. Upload preset must be specified when using unsigned upload."

**Step E4.** Body / Send Body:
- **Send Body:** Yes.
- **Body Content Type:** Form-Data (or “Multipart form”, depending on n8n version). Not JSON.

**Step E5.** Add two form fields:

**Field 1 – file**
- **Name:** `file`
- **Value:** (use expression)  
  `data:image/jpeg;base64,{{ $('GEMINI').item.json.candidates[0].content.parts[0].inlineData.data }}`  
  (Copy-paste exactly; the expression gets the base64 image from GEMINI.)

**Field 2 – eager**
- **Name:** `eager`
- **Value:** (use expression — one line, no line breaks):  
  `l_text:Arial_60_bold:{{ encodeURIComponent($('Webhook').item.json.body.pet_name || 'Pet') }}/fl_layer_apply,g_south,y_0.08`

**Step E6.** Save the node.  
**Check:** Run the workflow with **theme: "fireman"** and a **pet_name** set. Open the Cloudinary Upload node execution: the response should be JSON with an `eager` array and inside it an object with `secure_url`. If you get 401, check API Key and Secret.

---

## Part F: True branch — call your API with the Cloudinary image URL

**Step F1.** Add another **HTTP Request** node after **Cloudinary Upload**. Connect: **Cloudinary Upload** → this new node.

**Step F2.** Configure this node to match your **existing** Supabase/receive-n8n-image call, but with **image_url** instead of **image_base64**:

| Field | Value |
|--------|--------|
| **Name** | `Supabase (with nametag)` or keep `Supabase` if you prefer |
| **Method** | POST |
| **URL** | Your receive-n8n-image URL (e.g. `https://fluffyfriends.online/api/receive-n8n-image`) |
| **Send Headers** | Yes |
| **Header 1** | Name: `X-Webhook-Secret`  Value: your webhook secret |
| **Send Body** | Yes |
| **Body Content Type** | JSON |

**Step F3.** Body (JSON) — use this exactly, with your real values where noted:

```json
{
  "image_url": "{{ $('Cloudinary Upload').item.json.eager[0].secure_url }}",
  "pet_name": "{{ $('Webhook').item.json.body.pet_name || 'Test Pet' }}",
  "original_image_url": "{{ $('Webhook').item.json.body.test_image || '' }}",
  "status": "completed",
  "showcase_consent": "{{ $('Webhook').item.json.body.showcase_consent === true || $('Webhook').item.json.body.showcase_consent === 'true' ? 'true' : 'false' }}"
}
```

- **Do not** send `image_base64` in this branch — only `image_url`.
- The first line takes the image-with-name-tag URL from Cloudinary.

**Step F4.** Save the node.  
**Check:** Run the workflow with **theme: "fireman"** and a pet name. The portrait should appear in your app/gallery **with** the name on the image (and stored in Supabase via receive-n8n-image).

---

## Part G: Final check

**Step G1.** Test **fireman** + pet name → you should see the name tag on the portrait.

**Step G2.** Test **spaceman** (or another theme) → you should see the portrait **without** a name tag, same as before.

**Step G3.** If the name position is wrong (too high/low), see **“Name tag position and embroidery”** below.

---

## Name tag position and embroidery

Use this section to **(1) change the text position** on the image and **(2) make the text look like embroidery** on the fireman jacket (outline/stroke, colors).

### 1. Change the position on the image

The text is placed with **gravity** (anchor point) plus **x** and **y** offsets. Everything goes in the **eager** form field of the Name Tag node, after `fl_layer_apply,`.

**Current (bottom center, 8% from bottom):**
- Placement part: `g_south,y_0.08`

**Gravity options (anchor point):**
- `g_south` — bottom center (default in the doc)
- `g_south_west` — bottom left
- `g_south_east` — bottom right
- `g_center` — center
- `g_north` — top center
- `g_north_west` — top left
- `g_north_east` — top right

**Offsets (after the gravity, comma-separated):**
- **Percent:** `x_0.1` = 10% from anchor horizontally; `y_0.05` = 5% from anchor vertically. Use decimals, e.g. `y_0.12` = 12% from bottom.
- **Pixels:** `x_20`, `y_20` = 20 px from anchor.

**Examples:**
- Chest area (center, slightly above middle):  
  `g_center,y_0.15`
- Bottom left corner:  
  `g_south_west,x_0.08,y_0.08`
- Bottom right:  
  `g_south_east,x_0.08,y_0.08`
- Lower, closer to bottom edge:  
  `g_south,y_0.03`

**Steps:**
1. Open the **Name Tag** (Cloudinary Upload) node in n8n.
2. Find the **eager** form field (the long string starting with `l_text:...`).
3. Replace only the **placement** part (the bit after `fl_layer_apply,`). Right now it is `g_south,y_0.08`. Change to one of the examples above (or your own `g_...,x_...,y_...`).
4. Save and run a fireman test; adjust `x_` / `y_` until the name sits where you want on the jacket.

### 2. Make it look like embroidery (outline / stroke)

Embroidery-style text usually has a **visible outline** (stroke) and often slightly **spaced letters**. In Cloudinary you do that with:
- **Text style:** add `stroke` and optionally `letter_spacing_<pixels>` to the font part of `l_text`.
- **Stroke look:** add `bo_<width>px_solid_<color>` **before** `fl_layer_apply` (it’s a qualifier on the text layer). Use a dark outline (e.g. dark red or black) and a light or gold fill to mimic thread.

**Basic embroidery-style example (yellow/gold text, dark red outline):**
- Replace your current **eager** value with (one line, no line breaks):

```
co_rgb:F5D76E,l_text:Arial_60_bold_stroke_letter_spacing_4:{{ encodeURIComponent($('Webhook').item.json.body.pet_name || 'Pet') }}/bo_3px_solid_rgb:922B21/fl_layer_apply,g_south,y_0.08
```

- **Meaning:**  
  - `co_rgb:F5D76E` — fill color (golden yellow).  
  - `l_text:Arial_60_bold_stroke_letter_spacing_4:...` — font, size, bold, stroke, letter spacing.  
  - `bo_3px_solid_rgb:922B21` — 3 px solid dark red outline (embroidery thread look).  
  - `fl_layer_apply,g_south,y_0.08` — apply layer and position (change `g_south,y_0.08` as in section 1 if you want another position).

**Steps:**
1. In the **Name Tag** node, open the **eager** form field.
2. **Add stroke and optional letter spacing** in the font part: e.g. change `Arial_60_bold` to `Arial_60_bold_stroke_letter_spacing_4`.
3. **Add outline:** after the text part (after the closing `:` and the pet name expression), add `/bo_3px_solid_rgb:922B21` (or `bo_2px_solid_black`, etc.) **before** `/fl_layer_apply`.
4. **Set fill color:** at the very start of the overlay add `co_rgb:F5D76E,` (or another color like `co_white` / `co_rgb:2C3E50`) so the text has a visible fill and the stroke stands out.
5. Save and run a fireman test. Tweak:
   - Outline: `bo_2px_solid_black`, `bo_4px_solid_rgb:922B21`, etc.
   - Fill: `co_white`, `co_rgb:F5D76E`, `co_rgb:1A1A1A`.
   - Letter spacing: `letter_spacing_2`, `letter_spacing_6`.

**Combined (position + embroidery):**  
Use the same eager string as above but change the last part to your desired position, e.g. `fl_layer_apply,g_center,y_0.15` for chest area.

---

## Quick reference

| What | Where |
|------|--------|
| Theme check | IF: `body.theme` equals `fireman` |
| No nametag | IF (false) → Convert to File → Supabase (`image_base64`) |
| With nametag | IF (true) → Cloudinary Upload → Supabase (`image_url`) |
| Pet name to Cloudinary | In the **eager** form field, URL-encoded |
| Image URL to your API | `eager[0].secure_url` from Cloudinary response |
| Position + embroidery style | See **Name tag position and embroidery** (gravity, x/y, stroke, `bo_`, color) |

---

## Binary / image data after IF (Name Tag has no image)

Logic nodes like **IF** (and sometimes **Merge**) often pass only JSON and can drop binary or very large fields. So the item that reaches **Name Tag** after **IF (Tag) → True** may no longer contain the generated image.

**Solution 1 — Use node references (recommended)**  
In the Name Tag node, **do not** use the current item for the image. Use an expression that reads from the **GEMINI** node by name:

- **file:** `data:image/jpeg;base64,{{ $('GEMINI').item.json.candidates[0].content.parts[0].inlineData.data }}`

n8n resolves `$('GEMINI').item` to the output of the GEMINI node in the **same execution**, so the image is still available even though it did not pass through the IF. Ensure the Name Tag node’s **file** field uses this expression (see table at the top of this doc).

**Solution 2 — Merge GEMINI back in (if Solution 1 fails)**  
If in your n8n version the reference to GEMINI is empty or wrong (e.g. different execution context), reattach the GEMINI output to the flow before Name Tag:

1. Add a **Merge** node. Set mode to **Combine** / **Combine by position** (one item from each input).
2. Connect **GEMINI** → **Merge** (input 1).
3. Connect **IF (Tag) True** → **Merge** (input 2).
4. Connect **Merge** → **Name Tag** (replace the direct wire from IF to Name Tag).

Then in the Name Tag node you can use either:
- `$('GEMINI').item.json.candidates[0].content.parts[0].inlineData.data` (unchanged), or  
- The first input of Merge usually carries the GEMINI item, so `$json.candidates[0].content.parts[0].inlineData.data` may work (depending on how Merge merges the two items; if the merged item has both, use the path that has `candidates`).

Flow: **GEMINI** → IF (Tag) → True → **Merge** ← **GEMINI** (second input from GEMINI); **Merge** → Name Tag.

---

## If you're waiting for Cloudinary OTP (temporary bypass)

Cloudinary sometimes delays the OTP to reveal the API Secret. You can keep the rest of the flow working while you wait:

1. **Temporarily** disconnect the **True** output of the IF from **Name Tag**.
2. Connect the **True** output of the IF to **Convert to File** (the same node the False branch uses).
3. Connect **Convert to File** to your existing **Supabase** node that sends `image_base64` to receive-n8n-image.

Result: **fireman** (and any other theme on the True branch) will complete and show in the app **without** the name tag overlay. Once you have the API Secret from Cloudinary, create the Basic Auth credential, reconnect **IF (True)** → **Name Tag** → **Supabase (with nametag)** as in Part E–F, and the name tag will work.

---

## If something goes wrong

- **"Eager parameter is not allowed when using unsigned upload" / "Upload preset must be specified when using unsigned upload":**  
  Cloudinary is treating the request as **unsigned**. The name-tag flow uses **eager** (dynamic text overlay), which is only allowed with **signed** upload. Fix: in the **Name Tag** (or Cloudinary Upload) node, set **Authentication** to **Basic Auth** (or HTTP Basic Auth) and select a credential where the **username** is your Cloudinary **API Key** and the **password** is your Cloudinary **API Secret**. Create that credential in n8n under Settings → Credentials (Part D). Do not leave the node without auth or with only an upload_preset — that makes the upload unsigned and causes this error.
- **401 "unknown api_key" / "Authorization failed":** Cloudinary doesn’t recognise the key. Check: (1) **Basic Auth User** must be the **API Key** (the numeric key from Dashboard → API Keys). (2) **Basic Auth Password** must be the **API Secret** (revealed via OTP). If they’re swapped or the Key has a typo, you get "unknown api_key". Once you have the Secret, re-save the credential and test again.
- **401 from Cloudinary (general):** Wrong API Key or API Secret, or wrong credential selected in the node.
- **No `eager` in response:** Check the **eager** form field is exactly one transformation string (no extra quotes or commas in the expression).
- **Portrait not in gallery:** Check the second HTTP Request (Supabase) URL and X-Webhook-Secret; check **image_url** in the body is the expression that reads from Cloudinary Upload.
- **Name tag missing on fireman:** Confirm IF true branch is connected to Cloudinary Upload and that **eager** contains the expression with `pet_name`.

You can do this in small steps: finish Part B and C first (theme check + false branch), test spaceman, then add Part D–F for fireman + name tag.
