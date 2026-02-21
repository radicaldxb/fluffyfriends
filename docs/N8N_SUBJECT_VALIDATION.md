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
- **URL:** Same as your portrait GEMINI node, but use a **vision-only** model, e.g.  
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=YOUR_GEMINI_API_KEY`  
  (Use your real key or credential; same as the main GEMINI node.)
- **Send body:** JSON.
- **Body:**

```json
{
  "contents": [{
    "parts": [
      {
        "inlineData": {
          "mimeType": "image/jpeg",
          "data": "{{ $('Extract user image').item.json.data }}"
        }
      },
      {
        "text": "You are a strict image validator for a pet portrait app. The image must show EXACTLY ONE pet (a single dog OR a single cat). Rules: Exactly one dog or one cat only. No multiple pets, no group photos of animals. No humans (no people, no faces, no hands). No objects as main subject (no fruit, food, toys, furniture). No other animals. Reply with exactly one line: VALID: yes   OR   VALID: no   REASON: <one short reason>"
      }
    ]
  }],
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

## Quick reference (copy-paste)

**If node – Value 1:**  
`{{ $json.candidates?.[0]?.content?.parts?.[0]?.text ?? '' }}`

**If node – Operator:**  
Contains

**If node – Value 2:**  
`VALID: no`

**Reject node – Body (JSON):**
```json
{
  "rejected": true,
  "reason": "Please upload a photo of a single pet only (no group photos, people, or objects).",
  "original_image_url": "{{ $('Webhook').item.json.body.test_image }}",
  "pet_name": "{{ $('Webhook').item.json.body.pet_name || 'My Pet' }}"
}
```
