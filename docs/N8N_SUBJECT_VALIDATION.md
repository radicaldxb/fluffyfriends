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
