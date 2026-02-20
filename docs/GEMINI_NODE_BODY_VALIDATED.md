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
            "text": "INSTRUCTION: Create a high-fidelity, photorealistic 16:9 WIDESCREEN image.\n1. SUBJECT: Use the pet from Image 1. Preserve exact facial features, ear shape, and head tilt.\n2. COSTUME: Use the costume/style from Image 2.\n3. COMPOSITION: Render a cinematic waist-up shot. Show the pet's head and the upper torso wearing the costume. Ensure there is ample space on the left and right sides of the subject.\n4. DIMENSIONS: Force a 16:9 widescreen aspect ratio. Do not zoom in too tightly; ensure the suit and professional setting are visible for high-quality printing."
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
              "data": $('Extract Theme Image').item.json.data
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

**Node references:**
- `$('Extract from File')` = pet image (from HTTP Request → Extract from File after fetching pet photo)
- `$('Extract Theme Image')` = theme image (from Fetch Theme Image → Extract Theme Image)

**If your node names are different:**
- Replace `'Extract from File'` with your pet image Extract node name
- Replace `'Extract Theme Image'` with your theme Extract node name (e.g., `'Master Theme'` if that's what you named it)

---

## If n8n expects a single-line expression

Use this (same content, one line):

```
={{ { "contents": [ { "parts": [ { "text": "INSTRUCTION: Create a high-fidelity, photorealistic 16:9 WIDESCREEN image.\n1. SUBJECT: Use the pet from Image 1. Preserve exact facial features, ear shape, and head tilt.\n2. COSTUME: Use the costume/style from Image 2.\n3. COMPOSITION: Render a cinematic waist-up shot. Show the pet's head and the upper torso wearing the costume. Ensure there is ample space on the left and right sides of the subject.\n4. DIMENSIONS: Force a 16:9 widescreen aspect ratio. Do not zoom in too tightly; ensure the suit and professional setting are visible for high-quality printing." }, { "inlineData": { "mimeType": "image/jpeg", "data": $('Extract from File').item.json.data } }, { "inlineData": { "mimeType": "image/jpeg", "data": $('Extract Theme Image').item.json.data } } ] } } ], "safetySettings": [ { "category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE" }, { "category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE" }, { "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE" }, { "category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE" } ], "generationConfig": { "temperature": 0.7 } } }}
```

---

## Checklist

- [ ] Body is in **Expression** mode (not fixed JSON).
- [ ] Uses **inlineData** and **mimeType** (camelCase) — not `inline_data`/`mime_type`.
- [ ] Uses **`$('Extract from File').item.json.data`** and **`$('Extract Theme Image').item.json.data`** (or your actual node names).
- [ ] No extra `{{` or `}}`; exactly one `={{ ... }}` wrapping the whole object.
- [ ] Node names match your workflow:
  - **"Extract from File"** = pet image Extract node
  - **"Extract Theme Image"** = theme image Extract node (or `"Master Theme"` if that's your name)

## Your node names

If your Extract nodes are named differently, update the references:

- **Pet image:** `$('Extract from File')` → change to your pet Extract node name
- **Theme image:** `$('Extract Theme Image')` → change to your theme Extract node name (e.g., `$('Master Theme')` if that's what you named it)

If the node returns “data is not defined” or similar, the Extract from File / Master_Fireman nodes may output base64 under a different property (e.g. `binary.data`). In that case use the **Binary** tab or the property that actually contains the base64 string.
