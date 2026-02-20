# GEMINI Node - Corrected with Theme-Specific Prompts

## Issues in Your Current JSON

1. ❌ **Backticks (`) don't work** in n8n expressions - use string concatenation instead
2. ❌ **`${$node[...]}` syntax is wrong** - use `{{ }}` for expressions
3. ❌ **`$node["Webhook"]` is wrong** - use `$json.body.theme` or `$('Webhook').json.body.theme`
4. ❌ **`inline_data` should be `inlineData`** (camelCase)
5. ❌ **`mime_type` should be `mimeType`** (camelCase)
6. ❌ **Missing safety settings** - required for Gemini API
7. ⚠️ **Image order**: Your prompt references Image 1 (theme) and Image 2 (pet), which matches your current order

---

## Solution 1: IF/Switch Node (Recommended)

Add an **IF node** before GEMINI to set a theme-specific prompt variable.

### Step 1: Add IF Node

**Position**: After Merge node, before GEMINI node

**IF Node Configuration**:
- **Condition**: `{{ $json.body.theme }}` equals `"fireman"`
- **Output**: `true` → Fireman branch, `false` → Spaceman branch

### Step 2: Add Set Nodes

**In Fireman branch** (IF = true):
- Add a **Set node**
- **Fields to Set**:
  - `themePrompt` = (see Fireman prompt below)

**In Spaceman branch** (IF = false):
- Add a **Set node**  
- **Fields to Set**:
  - `themePrompt` = (see Spaceman prompt below)

### Step 3: Update GEMINI Node

Use this corrected JSON body (Expression mode ON):

```javascript
={{
  {
    "contents": [
      {
        "parts": [
          {
            "text": "{{ $json.themePrompt }}"
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

## Theme-Specific Prompts

### Fireman Prompt (for Set node)

```
INSTRUCTION: Create a high-fidelity, photorealistic 16:9 WIDESCREEN fireman portrait.

1. SUBJECT: Use the pet from Image 2. This is the absolute identity lock. Preserve exact facial features, ear shape, and head tilt. Maintain the pet's unique characteristics and expression.

2. STYLE & ENVIRONMENT: Use Image 1 as the master reference for the fireman aesthetic. Match the artistic style of Image 1 exactly:
   - Photorealistic rendering with professional photography quality
   - Natural, even lighting that highlights the uniform details
   - Professional portrait composition
   - Color accuracy: match the red/yellow tones and reflective materials from Image 1

3. COSTUME: Apply the fireman uniform and gear from Image 1 with complete accuracy:
   - Firefighter helmet with reflective visor
   - Fire-resistant jacket/turnout coat with reflective stripes
   - Matching pants and boots
   - Any badges, patches, or insignia visible in Image 1

4. ARTISTIC INTEGRATION: The pet must be fully integrated into the medium of Image 1. Match the texture, shadows, lighting, and overall aesthetic style exactly.

5. WIDESCREEN COMPOSITION: Center the subject. Ensure a "Cinematic Wide" view with ample space on left and right sides.

6. NO CLIPPING: Show the subject from head to waist. Ensure there is visible space/background at the bottom of the frame below the costume.

7. NO EXTRA LIMBS: Terminate the render at the torso. Do not draw legs or paws.

8. QUALITY: Output must be print-ready, high-resolution, with sharp details on the uniform, helmet, and pet's features.
```

### Spaceman Prompt (for Set node)

```
INSTRUCTION: Create a high-fidelity, photorealistic 16:9 WIDESCREEN spaceman portrait.

1. SUBJECT: Use the pet from Image 2. This is the absolute identity lock. Preserve exact facial features, ear shape, and head tilt. Maintain the pet's unique characteristics and expression.

2. STYLE & ENVIRONMENT: Use Image 1 as the master reference for the spaceman aesthetic. Match the artistic style of Image 1 exactly:
   - Photorealistic rendering with professional photography quality
   - Lighting that matches Image 1 (studio lighting, space environment glow, or natural light)
   - Professional portrait composition
   - Color accuracy: match the white/silver tones, reflective surfaces, and any colored accents from Image 1

3. COSTUME: Apply the astronaut suit and gear from Image 1 with complete accuracy:
   - Space helmet with visor (reflective or clear as shown in Image 1)
   - White/colored spacesuit with patches, mission badges, or NASA insignia
   - Gloves and boots matching the suit design
   - Any equipment or details visible in Image 1

4. ARTISTIC INTEGRATION: The pet must be fully integrated into the medium of Image 1. Match the texture, shadows, lighting, and overall aesthetic style exactly.

5. WIDESCREEN COMPOSITION: Center the subject. Ensure a "Cinematic Wide" view with ample space on left and right sides.

6. NO CLIPPING: Show the subject from head to waist. Ensure there is visible space/background at the bottom of the frame below the costume.

7. NO EXTRA LIMBS: Terminate the render at the torso. Do not draw legs or paws.

8. QUALITY: Output must be print-ready, high-resolution, with sharp details on the suit, helmet, and pet's features.
```

---

## Solution 2: Single Expression with Conditional (Alternative)

If you prefer a single expression without IF/Switch nodes, use this:

```javascript
={{
  {
    "contents": [
      {
        "parts": [
          {
            "text": "{{ $json.body.theme === 'fireman' ? 'INSTRUCTION: Create a high-fidelity, photorealistic 16:9 WIDESCREEN fireman portrait.\n\n1. SUBJECT: Use the pet from Image 2. This is the absolute identity lock. Preserve exact facial features, ear shape, and head tilt.\n\n2. STYLE & ENVIRONMENT: Use Image 1 as the master reference for the fireman aesthetic. Match the artistic style of Image 1 exactly: photorealistic rendering, natural even lighting, professional portrait composition, color accuracy matching red/yellow tones and reflective materials.\n\n3. COSTUME: Apply the fireman uniform and gear from Image 1: firefighter helmet with reflective visor, fire-resistant jacket/turnout coat with reflective stripes, matching pants and boots, badges/patches/insignia.\n\n4. ARTISTIC INTEGRATION: The pet must be fully integrated into the medium of Image 1. Match texture, shadows, lighting, and overall aesthetic style exactly.\n\n5. WIDESCREEN COMPOSITION: Center the subject. Ensure a \"Cinematic Wide\" view with ample space on left and right sides.\n\n6. NO CLIPPING: Show the subject from head to waist. Ensure visible space/background at the bottom below the costume.\n\n7. NO EXTRA LIMBS: Terminate at the torso. Do not draw legs or paws.\n\n8. QUALITY: Print-ready, high-resolution, sharp details on uniform, helmet, and pet features.' : 'INSTRUCTION: Create a high-fidelity, photorealistic 16:9 WIDESCREEN spaceman portrait.\n\n1. SUBJECT: Use the pet from Image 2. This is the absolute identity lock. Preserve exact facial features, ear shape, and head tilt.\n\n2. STYLE & ENVIRONMENT: Use Image 1 as the master reference for the spaceman aesthetic. Match the artistic style of Image 1 exactly: photorealistic rendering, lighting matching Image 1 (studio/space environment/natural), professional portrait composition, color accuracy matching white/silver tones and reflective surfaces.\n\n3. COSTUME: Apply the astronaut suit and gear from Image 1: space helmet with visor, white/colored spacesuit with patches/mission badges/NASA insignia, gloves and boots matching suit design.\n\n4. ARTISTIC INTEGRATION: The pet must be fully integrated into the medium of Image 1. Match texture, shadows, lighting, and overall aesthetic style exactly.\n\n5. WIDESCREEN COMPOSITION: Center the subject. Ensure a \"Cinematic Wide\" view with ample space on left and right sides.\n\n6. NO CLIPPING: Show the subject from head to waist. Ensure visible space/background at the bottom below the costume.\n\n7. NO EXTRA LIMBS: Terminate at the torso. Do not draw legs or paws.\n\n8. QUALITY: Print-ready, high-resolution, sharp details on suit, helmet, and pet features.' }}"
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

**Note**: This single-expression approach is harder to maintain. Solution 1 (IF/Switch) is recommended.

---

## Image Order Reference

Based on your workflow:
- **Image 1** (first inlineData) = Theme master image (`Extract theme`)
- **Image 2** (second inlineData) = Pet photo (`Extract user image`)

Your prompt correctly references:
- "Use Image 1 as the master reference" = Theme image ✅
- "Use the pet from Image 2" = Pet image ✅

---

## Key Fixes Applied

✅ Fixed syntax: Removed backticks, used proper `{{ }}` expressions  
✅ Fixed field names: `inlineData`, `mimeType` (camelCase)  
✅ Fixed node references: `$('Extract theme')`, `$('Extract user image')`  
✅ Added safety settings: Required for Gemini API  
✅ Theme-specific prompts: Different prompts for fireman vs spaceman  
✅ Maintained your requirements: No clipping, no extra limbs, widescreen, etc.

---

## Testing Checklist

- [ ] IF node correctly routes based on theme
- [ ] Set nodes assign correct prompts
- [ ] GEMINI node receives `themePrompt` variable
- [ ] Expression mode is ON in GEMINI node
- [ ] Image order matches prompt references
- [ ] Safety settings are included
- [ ] Temperature is 0.65 (as you specified)
