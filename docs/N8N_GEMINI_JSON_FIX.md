# n8n: Fix "JSON parameter needs to be valid JSON" in GEMINI Node

## Problem

The prompt from Supabase contains **newlines, quotes, and special characters** that break JSON when inserted directly. The GEMINI node needs the prompt to be **properly escaped** for JSON.

---

## Solution: Use JSON.stringify or Proper Escaping

The prompt text needs to be **JSON-escaped** before being inserted into the JSON body.

---

## Option 1: Use JSON.stringify (Recommended)

**In GEMINI node JSON Body (Expression mode ON):**

```javascript
={{
  {
    "contents": [
      {
        "parts": [
          {
            "text": JSON.stringify($json.prompt).slice(1, -1)
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

**Key change:** `"text": JSON.stringify($json.prompt).slice(1, -1)`
- `JSON.stringify()` escapes quotes, newlines, etc.
- `.slice(1, -1)` removes the outer quotes (since we're already inside a JSON string)

---

## Option 2: Build JSON Object First, Then Stringify

If Option 1 doesn't work, build the entire object and stringify:

```javascript
={{ JSON.stringify({
  "contents": [
    {
      "parts": [
        {
          "text": $json.prompt
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
}) }}
```

**Note:** This returns a JSON string, so make sure the HTTP Request node is set to send it as JSON (not raw).

---

## Option 3: Check Expression Mode

**Make sure Expression mode is ON:**

1. In GEMINI node, click **JSON Body** field.
2. Click the **fx** icon (Expression mode) — it should be **highlighted/active**.
3. If Expression mode is OFF, the `{{ }}` won't evaluate and you'll get JSON errors.

---

## Option 4: Verify Set Node Output

**Check that Set node is outputting prompt correctly:**

1. Execute Set node.
2. Check OUTPUT — `prompt` field should show the full text.
3. If `prompt` is null/undefined, fix Set node first (see `N8N_FIX_UNDEFINED_PROMPT.md`).

---

## Most Likely Fix

**Use Option 1** — `JSON.stringify($json.prompt).slice(1, -1)` properly escapes the prompt text for JSON.

The prompt from Supabase has newlines (`\n`) and quotes that need escaping. `JSON.stringify()` handles this automatically.

---

## Test

After updating GEMINI JSON Body:

1. Execute GEMINI node (or run full workflow).
2. Check for errors — should not see "JSON parameter needs to be valid JSON".
3. If it works, GEMINI should receive the prompt and generate the image.
