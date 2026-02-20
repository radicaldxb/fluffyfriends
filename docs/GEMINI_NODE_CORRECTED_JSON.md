# GEMINI Node - Corrected JSON Body

## Current Workflow Structure

After deleting disabled nodes, your workflow should be:
1. **Webhook** → triggers two branches:
   - **HTTP Request** (fetches pet image) → **Extract from File** → **Merge** (input 1)
   - **Fetch Theme Image** → **Extract from File1** → **Merge** (input 0)
2. **Merge** → combines both images
3. **GEMINI** → processes the merged data
4. **Convert to File** → **Supabase**

## Corrected GEMINI JSON Body

**Paste this into GEMINI node → JSON Body (Expression mode):**

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

## Key Changes

**Image 1 (Pet):** `$('Extract from File').item.json.data`
- This is the pet image from the HTTP Request → Extract from File branch

**Image 2 (Theme):** `$('Extract from File1').item.json.data`
- This is the theme image from Fetch Theme Image → Extract from File1 branch
- **Changed from:** `$('Master Theme').item.json.data` (which no longer exists)

## How to Apply

1. Click **GEMINI** node in your workflow
2. Find **JSON Body** field
3. Make sure it's in **Expression mode** (fx icon should be active)
4. Replace the entire JSON body with the code above
5. **Important:** Make sure the node references match your actual node names:
   - `Extract from File` = the node that extracts the pet image
   - `Extract from File1` = the node that extracts the theme image
6. Save the workflow

## Verify Node Names

Check your workflow to confirm these node names exist:
- ✅ **"Extract from File"** - extracts pet image (from HTTP Request)
- ✅ **"Extract from File1"** - extracts theme image (from Fetch Theme Image)

If your node names are different, update the references accordingly:
- Pet image node → use that name instead of `Extract from File`
- Theme image node → use that name instead of `Extract from File1`

## Image Order

The prompt says:
- **Image 1** = Pet (first inlineData)
- **Image 2** = Theme/style (second inlineData)

This matches the order in the JSON above.
