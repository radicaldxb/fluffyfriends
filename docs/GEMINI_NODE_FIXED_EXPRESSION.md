# GEMINI Node - Fixed JSON Body Expression

## Error
"JSON parameter needs to be valid JSON" - The expression isn't evaluating to valid JSON.

## Solution: Use This Exact Expression

**In GEMINI node → JSON Body field:**

1. **Make sure Expression mode is ON** (fx icon active)
2. **Paste this EXACT expression:**

```javascript
={{
  {
    "contents": [
      {
        "parts": [
          {
            "text": "INSTRUCTION: Create a high-fidelity, photorealistic 16:9 WIDESCREEN image.\n1. SUBJECT: Use the pet from Image 1. Preserve exact facial features, ear shape, and head tilt.\n2. COSTUME: Use the costume/style from Image 2.\n3. COMPOSITION: Render a cinematic waist-up shot. Show the pet's head and the upper torso wearing the costume. Ensure there is ample space on the left and right sides of the subject.\n4. DIMENSIONS: Force a 16:9 widescreen aspect ratio. Do not zoom in too tightly; ensure the suit and professional setting are visible for high-quality printing."
          },
          {
            "inlineData": {
              "mimeType": "image/jpeg",
              "data": $('Extract user image').item.json.data
            }
          },
          {
            "inlineData": {
              "mimeType": "image/jpeg",
              "data": $('Extract from File1').item.json.data
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
      "temperature": 0.7
    }
  }
}}
```

---

## Important: Expression Mode Must Be ON

**Check:**
- ✅ fx icon is highlighted/active
- ✅ Field shows "Expression" mode
- ✅ You can paste the `={{ }}` expression

**If Expression mode is OFF:**
- The expression won't evaluate
- You'll get "JSON parameter needs to be valid JSON" error

---

## Single-Line Version (If Multi-Line Doesn't Work)

If n8n doesn't accept the multi-line format, use this single-line version:

```javascript
={{ { "contents": [ { "parts": [ { "text": "INSTRUCTION: Create a high-fidelity, photorealistic 16:9 WIDESCREEN image.\n1. SUBJECT: Use the pet from Image 1. Preserve exact facial features, ear shape, and head tilt.\n2. COSTUME: Use the costume/style from Image 2.\n3. COMPOSITION: Render a cinematic waist-up shot. Show the pet's head and the upper torso wearing the costume. Ensure there is ample space on the left and right sides of the subject.\n4. DIMENSIONS: Force a 16:9 widescreen aspect ratio. Do not zoom in too tightly; ensure the suit and professional setting are visible for high-quality printing." }, { "inlineData": { "mimeType": "image/jpeg", "data": $('Extract user image').item.json.data } }, { "inlineData": { "mimeType": "image/jpeg", "data": $('Extract from File1').item.json.data } } ] } } ], "safetySettings": [ { "category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE" }, { "category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE" }, { "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE" }, { "category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE" } ], "generationConfig": { "temperature": 0.7 } } }}
```

---

## Verify Node Names Match

Make sure these node names exist in your workflow:
- ✅ `Extract user image` - extracts pet image
- ✅ `Extract from File1` - extracts theme image

If your node names are different, update the references:
- Pet image node → replace `$('Extract user image')`
- Theme image node → replace `$('Extract from File1')`

---

## Troubleshooting

**"JSON parameter needs to be valid JSON":**
- Expression mode is OFF → Enable it (fx icon)
- Syntax error → Check for missing quotes, brackets, or commas
- Node reference doesn't exist → Verify node names match

**Test the expression:**
- After pasting, n8n should show a preview of the evaluated JSON
- If you see an error in the preview, fix the syntax
- The preview should show a valid JSON object
