# n8n: Subject validation (single pet only)

Subject validation now runs **in the n8n workflow** so it uses the same Gemini API key that already works for the portrait step. No `GEMINI_API_KEY` is needed in Netlify.

---

## Step-by-step checklist (do in order)

- [ ] **Step 1 – Supabase:** Run the SQL below in Supabase SQL Editor (once).
- [ ] **Step 2 – n8n:** Add the **Validate subject** HTTP Request node; connect **Extract user image** → **Validate subject**.
- [ ] **Step 3 – n8n:** Add the **If** node; set condition (Value 1, Contains, Value 2); connect **Validate subject** → **If**.
- [ ] **Step 4 – n8n:** Add the **Reject** HTTP Request node; connect **If (True)** → **Reject**.
- [ ] **Step 5 – n8n:** Connect **If (False)** → **Merge** (so valid images go to portrait).
- [ ] **Step 6 – n8n:** Remove or bypass the old direct connection from **Extract user image** to **Merge** (validation must run first).
- [ ] **Step 7:** Save the workflow, set it to **Active**, then test with one valid pet photo and one invalid (e.g. group or person).

---

## Flow

1. **Webhook** → **User image** + **Fetch Theme Image** (unchanged).
2. **Extract user image** → **Validate subject** (new Gemini node).
3. **IF** node: if the validation response contains `VALID: no` → **Reject** (HTTP to your app with `rejected: true`); else → **Merge** → **GEMINI** (portrait) → **Convert to File** → **Supabase**.

So invalid images (group photo, human, object) never reach the main portrait GEMINI node.

## 1. Run SQL in Supabase (once)

In Supabase SQL Editor, run:

```sql
alter table public.pet_portraits add column if not exists rejection_reason text;
```

(See `supabase/run-add-rejection-reason.sql`.)

## 2. Add “Validate subject” node in n8n

- **Type:** HTTP Request.
- **Method:** POST.
- **URL:** Use a **vision/chat** model that returns text in `content.parts[0].text`. **Do not use** `gemini-3-pro-image-preview` (it returns empty `content` for text prompts). Use a model that returns text, e.g.:
  - **Working:** `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=YOUR_GEMINI_API_KEY`
  - Or: `gemini-1.5-flash` in the same URL pattern.
- **Send body:** JSON. In n8n, either camelCase (`inlineData`, `mimeType`) or snake_case (`inline_data`, `mime_type`) may work depending on the node; if one fails, try the other.
- **Body (working example):**

```json
{
  "contents": [
    {
      "parts": [
        {
          "inline_data": {
            "mime_type": "image/jpeg",
            "data": "{{ $('Extract user image').item.json.data }}"
          }
        },
        {
          "text": "You are a strict image validator. The image must show EXACTLY ONE pet (dog or cat). Rules: 1. Exactly one dog or cat only. 2. No humans/body parts. 3. No other animals. 4. No objects as main subjects. Reply with exactly one line: VALID: yes OR VALID: no REASON: <reason>"
        }
      ]
    }
  ],
  "generationConfig": {
    "maxOutputTokens": 128,
    "temperature": 0.1
  }
}
```

- **Response format:** JSON.

Connect: **Extract user image** → **Validate subject**.

## 3. Add IF node

- **Condition:** Must use **Contains** (string contains), **not** “Is not equal to” / “notEquals”. If you use “not equal to”, both valid and invalid images go to Reject.
- **Value 1:**  
  `{{ $json.candidates?.[0]?.content?.parts?.[0]?.text ?? '' }}`
- **Operation:** **Contains** (or “String contains”).
- **Value 2:** `VALID: no`

So: **Validate subject** → **IF**.  
- **True** (contains “VALID: no”) → go to **Reject** (step 4).  
- **False** → go to **Merge** (existing flow: Merge with theme, then GEMINI portrait, etc.).

## 4. Add “Reject” HTTP Request node

- **Method:** POST.
- **URL:** Your app callback, e.g.  
  `https://fluffyfriends-dev.netlify.app/api/receive-n8n-image`
- **Headers:** Same as your success Supabase node (e.g. `X-Webhook-Secret`).
- **Body (JSON):**

```json
{
  "rejected": true,
  "reason": "Please upload a photo of a single pet only (no group photos, people, or objects).",
  "original_image_url": "{{ $('Webhook').item.json.body.test_image }}",
  "pet_name": "{{ $('Webhook').item.json.body.pet_name || 'My Pet' }}"
}
```

(Optional: parse the Gemini validation text and put the actual reason in `reason`; otherwise the fixed message above is fine.)

Connect: **IF (True)** → **Reject**. Do **not** connect Reject to the rest of the workflow (workflow ends for this request).

## 5. Connect IF (False) to Merge

Connect **IF (False)** to your existing **Merge** node (the one that has **Extract theme** and the validated user image as inputs). So only when validation passes does the flow continue to the portrait GEMINI node.

## Summary

- **Validate subject:** Gemini 1.5 Flash, user image + strict prompt, returns VALID: yes/no + REASON.
- **IF** “VALID: no” → **Reject** (POST to `/api/receive-n8n-image` with `rejected: true` and `reason`).
- **IF** “VALID: yes” → **Merge** → **GEMINI** (portrait) → **Supabase** (success).

The app already handles rejection: it polls `pet_portraits` and shows `rejection_reason` when `status = 'rejected'`.

**Optional – gallery consent:** See the section below for detailed steps.

---

## Optional: Gallery consent (showcase in gallery)

If you want the **public gallery** to show only portraits where the user checked “I give permission for FluffyFriends to showcase my pet's portrait”, you need to pass that choice from the app → n8n → callback and store it in the database. The app already sends it; you only need to forward it in n8n and ensure the callback body includes it.



**Behaviour:** Only the **public gallery** (homepage section and `/gallery`) filters by `showcase_consent`. The **create flow** does **not** filter: after generation, the user **always** sees their own portrait on the success screen, whether or not they consented to showcase. So "no consent" only hides the portrait from the gallery, not from the creator.

### What to update exactly

| Step | Where | What to do |
|------|--------|------------|
| **1** | **Supabase** (SQL Editor) | Run once: `alter table public.pet_portraits add column if not exists showcase_consent boolean default true;` (see `supabase/run-add-showcase-consent.sql`). |
| **2** | **n8n – Supabase node** | Open the **Supabase** HTTP Request node (the one that POSTs to `.../api/receive-n8n-image` with `image_base64` and `status: "completed"`). In its **JSON body**, add one field: `"showcase_consent": {{ $('Webhook').item.json.body.showcase_consent }}`. Save the workflow. |

No app code changes are required. Only the **public gallery** filters by consent; the **create flow** never filters by it, so the user always sees their own portrait on the success screen after generation.

### What "step 2" is

**Step 2** means: in the **success path** of your workflow (after GEMINI has generated the portrait), the node that **POSTs the result to your app** (`/api/receive-n8n-image`) must send `showcase_consent` in the JSON body. That way the API can save it and the gallery can filter by it.

### Which node to edit

1. Open your **transform-pet** (or equivalent) workflow in n8n.
2. Find the **HTTP Request** node that runs when the portrait is **successful** — the one that:
   - **Method:** POST  
   - **URL:** `https://your-site.netlify.app/api/receive-n8n-image`  
   - **Body:** contains `image_base64`, `pet_name`, `original_image_url`, `status`  
   The success-callback node is named **“Supabase”** (e.g. in repo `docs/n8n-fluffyfriends-working.json` or in **Fluffyfriends-11.json** “Fluffyfriends-Step 5”).
3. That node is **not** the “Reject” node (which sends `rejected: true`). It’s the **Supabase** node that sends the **generated image** (base64) and `status: "completed"`.

### What to add to the body

In that node, the **JSON body** currently looks something like:

```json
{
  "image_base64": "{{ $('GEMINI').item.json.candidates[0].content.parts[0].inlineData.data }}",
  "pet_name": "{{ $json.pet_name || 'Test Pet' }}",
  "original_image_url": "{{ $json.test_image || '' }}",
  "status": "completed"
}
```

Add **one more field** so the callback includes the user’s consent:

- **Key:** `showcase_consent`  
- **Value (n8n expression):** the same consent flag that the app sent in the webhook body when the user started the flow.

The webhook receives the initial POST from your app with a `body` that includes `showcase_consent` (true/false). In n8n you reference that with the **Webhook** node’s output.

**Option A – body is built from the node that has the webhook data**

If the callback node gets data from a node that still has access to the webhook payload (e.g. from Merge, which often has access to the webhook item), use:

- **Expression:** `{{ $('Webhook').item.json.body.showcase_consent }}`

So add this line to the JSON body:

```json
"showcase_consent": {{ $('Webhook').item.json.body.showcase_consent }}
```

**Option B – body is built from a node that doesn’t have the webhook**

If the callback node only receives data from e.g. “GEMINI” or “Convert to File”, you must still pull the consent from the **Webhook** node by name:

- **Expression:** `{{ $('Webhook').item.json.body.showcase_consent }}`

So in the **same** JSON body as above, add:

```json
"showcase_consent": {{ $('Webhook').item.json.body.showcase_consent }}
```

**Full example body (with consent):**

```json
{
  "image_base64": "{{ $('GEMINI').item.json.candidates[0].content.parts[0].inlineData.data }}",
  "pet_name": "{{ $json.pet_name || 'Test Pet' }}",
  "original_image_url": "{{ $json.test_image || '' }}",
  "status": "completed",
  "showcase_consent": {{ $('Webhook').item.json.body.showcase_consent }}
}
```

(If your node uses a different structure for the image or pet name, keep your existing fields and only add the `showcase_consent` line.)

### Why this is “step 2”

- **Step 1** is running the SQL in Supabase that adds the `showcase_consent` column to `pet_portraits` (see `supabase/run-add-showcase-consent.sql`).
- **Step 2** is making sure n8n sends that value in the success callback so the API can store it. Without step 2, the API never receives `showcase_consent` and will fall back to its default (treat as consented for backward compatibility).

### After you add it

- When the user **checks** the optional “showcase my pet’s portrait” box, the app sends `showcase_consent: true` in the webhook payload → n8n forwards it → the API saves `showcase_consent: true` → the portrait appears in the gallery.
- When the user **leaves it unchecked**, the app sends `showcase_consent: false` → n8n forwards it → the API saves `false` → the portrait is **not** shown in the gallery.

---

## Troubleshooting: "Two dogs still go through"

**1. Swap the If node connections**

In n8n the If node has two outputs. Often the **first (top) output** = condition **true**, and the **second (bottom)** = condition **false**. If two-dog images still get a portrait:

- **Disconnect** both wires from the If node (to Image reject and to Merge).
- Connect the **other** output to **Image reject** than the one you had before.
- Connect the **other** output to **Merge**.
- Save and test again with a two-dog photo.

So: the branch that currently goes to **Merge** should go to **Image reject**, and the branch that currently goes to **Image reject** should go to **Merge**. After swapping, invalid images (VALID: no) must go to Image reject.

**2. Check what Validate Subject actually returns**

Run the workflow with a **two-dog** image. Open the **Validate Subject** node and look at its **output** (OUTPUT tab). Expand `candidates` → `0` → `content` → `parts` → `0` → `text`. 

- If the text says **"VALID: yes"** (or similar), Gemini is misclassifying; the validation prompt may need to be stricter (e.g. add "If you see two or more dogs or cats, you MUST reply VALID: no").
- If the text says **"VALID: no"**, then the If condition should be true and the problem is the **connections** (do step 1).

**4. Validate Subject returns empty `content`**

If the If node input shows `candidates[0].content` as `{}` (no `parts`, no `text`), the validation model is not returning text in the expected place. That makes the condition always false, so every image goes to Merge. **Fix:** In the Validate Subject node, change the URL to use **gemini-1.5-flash** (or another vision model that returns text), not **gemini-3-pro-image-preview**. The image-preview model is for generation and often gives empty content for vision Q&A.

**5. Confirm which branch is which**

After a run with a two-dog image, click the **If** node and check the OUTPUT tab. You should see either "True Branch (1 item)" or "False Branch (1 item)". For a two-dog image we want that item to go to **Image reject**. So whichever branch has 1 item when you use two dogs must be connected to **Image reject**. If that branch is currently connected to Merge, swap the two connections.

---

## Quick reference (copy-paste)

**If node – Value 1:**  
`{{ $json.candidates?.[0]?.content?.parts?.[0]?.text ?? '' }}`

**If node – Operator:**  
Contains

**If node – Value 2:**  
`VALID: no`  
**Important:** Use the literal text. In n8n, if Value 2 is set to `=VALID: no` (with a leading `=`), it is treated as an expression and can break the condition so that two‑pet images are never rejected. Use plain `VALID: no` (no leading `=`) or, if the field only allows expressions, use `="VALID: no"` so the value is the string.

**Reject node – Body (JSON):**
```json
{
  "rejected": true,
  "reason": "Please upload a photo of a single pet only (no group photos, people, or objects).",
  "original_image_url": "{{ $('Webhook').item.json.body.test_image }}",
  "pet_name": "{{ $('Webhook').item.json.body.pet_name || 'My Pet' }}"
}
```
