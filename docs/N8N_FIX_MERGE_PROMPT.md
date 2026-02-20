# n8n: Fix Merge Node to Pass Prompt Through

## Problem

The **Merge** node combines the two image extractions but **doesn't preserve the webhook body data** (including `prompt`). So when GEMINI runs, `$json` is just the merged image data, not the original webhook payload.

**Current flow:**
```
Webhook → [User image + Fetch Theme Image] → Extract → Merge → GEMINI
```

After Merge, `$json` = merged image data only. The `prompt` from `body.prompt` is lost.

---

## Solution: Add Set Node After Merge

Add a **Set** node between **Merge** and **GEMINI** to explicitly pass the prompt (and other webhook data) through.

### Step 1: Add Set Node

1. In n8n, add a **Set** node between **Merge** and **GEMINI**.
2. Name it: **"Add Prompt"** or **"Pass Webhook Data"**.

### Step 2: Configure Set Node

**Mode:** Keep Only Set Fields (or Merge - your choice)

**Fields to Set:**

| Name | Value |
|------|-------|
| `prompt` | `{{ $('Webhook').item.json.body.prompt }}` |
| `pet_name` | `{{ $('Webhook').item.json.body.pet_name }}` |
| `test_image` | `{{ $('Webhook').item.json.body.test_image }}` |
| `theme` | `{{ $('Webhook').item.json.body.theme }}` |
| `data_0` | `{{ $json.data }}` (from Merge input 0 - theme image) |
| `data_1` | `{{ $json.data }}` (from Merge input 1 - user image) |

**Wait** — Merge outputs combined data. Let me check Merge output structure...

Actually, Merge with `combineByPosition` outputs an array. So we need to access:
- Merge input 0 (theme): `$('Extract theme').item.json.data`
- Merge input 1 (user): `$('Extract user image').item.json.data`

**Better Set node config:**

| Name | Value |
|------|-------|
| `prompt` | `{{ $('Webhook').item.json.body.prompt }}` |
| `theme_image_data` | `{{ $('Extract theme').item.json.data }}` |
| `user_image_data` | `{{ $('Extract user image').item.json.data }}` |
| `pet_name` | `{{ $('Webhook').item.json.body.pet_name }}` |
| `test_image` | `{{ $('Webhook').item.json.body.test_image }}` |

### Step 3: Update GEMINI Node

Now GEMINI can use `$json.prompt` directly (from Set node output):

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
              "data": $json.theme_image_data
            }
          },
          {
            "inlineData": {
              "mimeType": "image/jpeg",
              "data": $json.user_image_data
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

## Alternative: Simpler Set Node (Just Prompt)

If you only need the prompt:

**Set node fields:**
- `prompt` = `{{ $('Webhook').item.json.body.prompt }}`
- `data` = `{{ $json.data }}` (keeps Merge output)

Then in GEMINI, use:
- `"text": "{{ $json.prompt }}"`
- Images: `$('Extract theme').item.json.data` and `$('Extract user image').item.json.data` (reference Extract nodes directly)

---

## Updated Workflow Structure

```
Webhook
  ├─→ User image → Extract user image → Merge (input 1)
  └─→ Fetch Theme Image → Extract theme → Merge (input 0)
       ↓
       Merge → Set (add prompt) → GEMINI → Convert to File → Supabase
```

---

## Why This Works

- **Merge** combines images but loses webhook context.
- **Set** node explicitly pulls `prompt` from Webhook and adds it to the data flow.
- **GEMINI** receives everything it needs: prompt + both images.
