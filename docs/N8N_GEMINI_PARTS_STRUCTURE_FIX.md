# n8n: Fix "required oneof field 'data' must have one initialized field"

## Problem

Gemini API error: `contents[0].parts[0].data: required oneof field 'data' must have one initialized field`

This means `parts[0]` (the text prompt) is missing or empty, so Gemini thinks it should be an image part.

---

## Root Cause

The `text` field in `parts[0]` is either:
- Empty/null/undefined
- Not being evaluated correctly
- Missing from the JSON structure

---

## Solution: Ensure Text Field Exists and Has Value

**In GEMINI node JSON Body (Expression mode ON):**

```javascript
={{
  {
    "contents": [
      {
        "parts": [
          {
            "text": $json.prompt || "Default prompt if missing"
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

**Key:** `$json.prompt || "Default prompt if missing"` ensures there's always a text value.

---

## Debug Steps

### Step 1: Check Set Node Output

1. Execute **Set** node.
2. Check **OUTPUT** — does `prompt` field exist and have text?
3. If `prompt` is null/undefined → Set node isn't getting it from Webhook.

### Step 2: Test with Hardcoded Text

Temporarily change GEMINI to:
```javascript
"text": "Test prompt"
```

If that works → issue is with `$json.prompt` value.
If that fails → issue is with JSON structure.

### Step 3: Verify Expression Mode

- Make sure **Expression mode is ON** (fx icon active).
- The field should show "Expression" not "Fixed".

---

## Alternative: Use String() to Ensure It's a String

If `$json.prompt` might be null/undefined:

```javascript
"text": String($json.prompt || "")
```

Or with a fallback:
```javascript
"text": String($json.prompt || "INSTRUCTION: Create a portrait using Image 1 as style and Image 2 as the pet.")
```

---

## Most Likely Fix

**The Set node isn't outputting `prompt` correctly, or `$json.prompt` is null.**

1. Check Set node OUTPUT — `prompt` should show full text.
2. If null, fix Set node expression: `{{ $('Webhook').item.json.body.prompt }}`
3. Then GEMINI should work with `"text": $json.prompt`.
