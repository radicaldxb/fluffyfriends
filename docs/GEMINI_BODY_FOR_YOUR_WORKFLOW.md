# GEMINI node body — ready to paste (your workflow)

## Your validated expression

**Paste this into GEMINI node → JSON body (Expression mode):**

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

---

## If your node names are different

**If your theme Extract node is named "Master Theme":**
- Change `$('Extract Theme Image')` → `$('Master Theme')`

**If your pet Extract node has a different name:**
- Change `$('Extract from File')` → your actual node name

**Example with "Master Theme":**
```javascript
"data": $('Master Theme').item.json.data
```

---

## What changed from your original

✅ **Fixed API fields:** `inline_data` → `inlineData`, `mime_type` → `mimeType` (Gemini requires camelCase)  
✅ **Fixed node syntax:** `$node["..."]` → `$('...').item.json.data` (modern n8n expression syntax)  
✅ **Updated prompt:** "fireman suit" → "costume/style" (works for all themes)  
✅ **Kept your settings:** 16:9 widescreen, cinematic waist-up, temperature 0.7

---

## Single-line version (if n8n requires it)

```
={{ { "contents": [ { "parts": [ { "text": "INSTRUCTION: Create a high-fidelity, photorealistic 16:9 WIDESCREEN image.\n1. SUBJECT: Use the pet from Image 1. Preserve exact facial features, ear shape, and head tilt.\n2. COSTUME: Use the costume/style from Image 2.\n3. COMPOSITION: Render a cinematic waist-up shot. Show the pet's head and the upper torso wearing the costume. Ensure there is ample space on the left and right sides of the subject.\n4. DIMENSIONS: Force a 16:9 widescreen aspect ratio. Do not zoom in too tightly; ensure the suit and professional setting are visible for high-quality printing." }, { "inlineData": { "mimeType": "image/jpeg", "data": $('Extract from File').item.json.data } }, { "inlineData": { "mimeType": "image/jpeg", "data": $('Extract Theme Image').item.json.data } } ] } } ], "safetySettings": [ { "category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE" }, { "category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE" }, { "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE" }, { "category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE" } ], "generationConfig": { "temperature": 0.7 } } }}
```
