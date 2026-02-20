# n8n Workflow Fix: Pass Prompt Through Merge

## The Problem

**Current flow:**
```
Webhook (has body.prompt) 
  → [User image + Fetch Theme Image] 
  → Extract 
  → Merge (combines images, loses webhook body)
  → GEMINI (can't access prompt anymore)
```

After **Merge**, `$json` is just the merged image data. The webhook `body.prompt` is lost.

---

## Solution: Add Set Node After Merge

Add a **Set** node between **Merge** and **GEMINI** to explicitly pass the prompt through.

### Workflow Structure (Fixed)

```
Webhook
  ├─→ User image → Extract user image → Merge (input 1)
  └─→ Fetch Theme Image → Extract theme → Merge (input 0)
       ↓
       Merge → Set (add prompt) → GEMINI → Convert to File → Supabase
```

---

## Step-by-Step Fix

### Step 1: Add Set Node

1. In n8n, add a **Set** node between **Merge** and **GEMINI**.
2. Name it: **"Add Prompt"**.

### Step 2: Configure Set Node

**Mode:** Merge (keep existing fields + add new ones)

**Fields to Set:**

| Name | Value | Notes |
|------|-------|-------|
| `prompt` | `{{ $('Webhook').item.json.body.prompt }}` | Pull prompt from Webhook |
| `pet_name` | `{{ $('Webhook').item.json.body.pet_name }}` | Optional: for Supabase callback |

**Keep:** The Set node will merge these fields with Merge's output.

### Step 3: Update GEMINI Node JSON Body

**Change the `text` field to:**

```javascript
"text": "{{ $json.prompt }}"
```

**Keep images as-is** (they reference Extract nodes directly):
```javascript
"data": $('Extract theme').item.json.data
"data": $('Extract user image').item.json.data
```

**Full GEMINI JSON Body (Expression mode ON):**

```javascript
={{
  {
    "contents": [
      {
        "parts": [
          {
            "text": "{{ $json.prompt }}"
          },
          {
            "inlineData": {
              "mimeType": "image/jpeg",
              "data": $('Extract theme').item.json.data
            }
          },
          {
            "inlineData": {
              "mimeType": "image/jpeg",
              "data": $('Extract user image').item.json.data
            }
          }
        ]
      }
    ],
    "safetySettings": [
      { "category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE" },
      { "category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE" },
      { "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE" },
      { "category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE" }
    ],
    "generationConfig": {
      "temperature": 0.65
    }
  }
}}
```

---

## Why This Works

1. **Set node** explicitly pulls `prompt` from the Webhook node and adds it to the data flow.
2. **GEMINI** receives `$json.prompt` from Set node output (simple, reliable).
3. **Images** still reference Extract nodes directly (no change needed).

---

## Alternative: Try Direct Reference First

Before adding Set node, try this in GEMINI (might work if Webhook is accessible):

```javascript
"text": "{{ $('Webhook').item.json.body.prompt }}"
```

If that shows `[undefined]` in the expression builder, use the Set node approach above.

---

## Test

1. Add Set node and configure as above.
2. Update GEMINI to use `{{ $json.prompt }}`.
3. Run a real execution from your site.
4. Check Set node output — should show `prompt` field with full theme text.
5. Check GEMINI execution — should use the prompt from Supabase.
