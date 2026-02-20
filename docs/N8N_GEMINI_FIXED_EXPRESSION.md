# n8n GEMINI Node - Fixed JSON Expression

## Problem

"JSON parameter needs to be valid JSON" — the prompt text contains newlines/quotes that break JSON when inserted directly.

---

## Solution: Build Object as JavaScript, Not JSON String

Instead of building a JSON string, build a **JavaScript object** and let n8n convert it to JSON (which handles escaping automatically).

---

## Corrected Expression (Copy This Entire Thing)

**In GEMINI node → JSON Body field (Expression mode ON - fx icon active):**

```javascript
={{
  {
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
  }
}}
```

**Key:** `"text": $json.prompt` (no quotes around `$json.prompt` — it's a JavaScript value, not a string)

---

## Why This Works

- `={{ }}` means "evaluate as JavaScript expression"
- Inside `{{ }}`, you're building a **JavaScript object**
- `$json.prompt` is a JavaScript value (string), not a JSON string
- n8n converts the JavaScript object to JSON automatically (handles escaping)
- No need for `JSON.stringify()` or manual escaping

---

## If That Still Fails: Alternative Approach

**Build the entire object and stringify it:**

```javascript
={{ JSON.stringify({
  contents: [
    {
      parts: [
        {
          text: $json.prompt
        },
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: $('Extract theme').item.json.data
          }
        },
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: $('Extract user image').item.json.data
          }
        }
      ]
    }
  ],
  safetySettings: [
    { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
    { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
    { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
    { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
  ],
  generationConfig: {
    temperature: 0.65
  }
}) }}
```

**Then** in HTTP Request node, set **Body Content Type** to **"Raw"** and **Content Type** to **"application/json"**.

---

## Checklist

- [ ] Expression mode is ON (fx icon active)
- [ ] Using `$json.prompt` (from Set node output)
- [ ] No quotes around `$json.prompt` in the expression
- [ ] Set node is outputting `prompt` correctly (check Set node OUTPUT)

---

## Debug Steps

1. **Check Set node output:**
   - Execute Set node
   - Check OUTPUT — `prompt` should show full text
   - If null/undefined, fix Set node first

2. **Test expression in GEMINI:**
   - Temporarily change `"text": $json.prompt` to `"text": "test"`
   - If that works → issue is with prompt value
   - If that fails → issue is with expression syntax

3. **Check for special characters:**
   - In Set node OUTPUT, look at the `prompt` value
   - If it has weird characters or is truncated, the prompt might be too long or malformed
