# GEMINI node body – validated version

## Issues in your original

1. **Gemini API uses camelCase**  
   Use **`inlineData`** and **`mimeType`**, not `inline_data` and `mime_type`.

2. **Invalid n8n expression**  
   - You had `{{ {` and `} }}` with **raw** `$node["Extract from File"].json["data"]` inside JSON.  
   - In n8n the **entire** body must be **one expression** that evaluates to a single object.  
   - Use **`$('Node Name').item.json.data`** (recommended), not `$node["Node Name"].json["data"]`.

3. **Image order**  
   Your order is correct: Image 1 = pet (Extract from File), Image 2 = style (Master_Fireman).

---

## Validated body (paste into GEMINI node, Expression mode)

Set the **JSON body** field to **Expression** and paste this (as one expression). Adjust line breaks if n8n requires a single line.

```javascript
={{
  {
    "contents": [
      {
        "parts": [
          {
            "text": "INSTRUCTION: Create a high-fidelity, photorealistic VERTICAL PORTRAIT.\n1. SUBJECT: Use the pet from Image 1. Preserve exact facial features, ear shape, and head tilt.\n2. COSTUME: Use the fireman suit from Image 2.\n3. COMPOSITION: Render a 'Portrait Headshot' terminated at the dog's mid-chest level. NO LEGS. Do not show paws or the lower body.\n4. DIMENSIONS: Force a vertical 2:3 aspect ratio. Even if Image 1 is rectangular, crop the dog's face into a vertical center frame."
          },
          {
            "inlineData": {
              "mimeType": "image/jpeg",
              "data": $('Extract from File').item.json.data
            }
          },
          {
            "inlineData": {
              "mimeType": "image/jpeg",
              "data": $('Master_Fireman').item.json.data
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

## If n8n expects a single-line expression

Use this (same content, one line):

```
={{ { "contents": [ { "parts": [ { "text": "INSTRUCTION: Create a high-fidelity, photorealistic VERTICAL PORTRAIT.\n1. SUBJECT: Use the pet from Image 1. Preserve exact facial features, ear shape, and head tilt.\n2. COSTUME: Use the fireman suit from Image 2.\n3. COMPOSITION: Render a 'Portrait Headshot' terminated at the dog's mid-chest level. NO LEGS. Do not show paws or the lower body.\n4. DIMENSIONS: Force a vertical 2:3 aspect ratio. Even if Image 1 is rectangular, crop the dog's face into a vertical center frame." }, { "inlineData": { "mimeType": "image/jpeg", "data": $('Extract from File').item.json.data } }, { "inlineData": { "mimeType": "image/jpeg", "data": $('Master_Fireman').item.json.data } } ] } } ], "safetySettings": [ { "category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE" }, { "category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE" }, { "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE" }, { "category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE" } ], "generationConfig": { "temperature": 0.7 } } }}
```

---

## Checklist

- [ ] Body is in **Expression** mode (not fixed JSON).
- [ ] Uses **inlineData** and **mimeType** (camelCase).
- [ ] Uses **`$('Extract from File').item.json.data`** and **`$('Master_Fireman').item.json.data`** (no `$node["..."]`).
- [ ] No extra `{{` or `}}`; exactly one `={{ ... }}` wrapping the whole object.
- [ ] Node names match your workflow: **"Extract from File"** and **"Master_Fireman"**.

If the node returns “data is not defined” or similar, the Extract from File / Master_Fireman nodes may output base64 under a different property (e.g. `binary.data`). In that case use the **Binary** tab or the property that actually contains the base64 string.
