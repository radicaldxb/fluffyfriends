# GEMINI Node - Ready to Paste (Corrected)

## Quick Fix: Single Expression with Theme-Specific Prompts

**Copy this entire expression into your GEMINI node JSON Body field (Expression mode ON):**

```javascript
={{
  {
    "contents": [
      {
        "parts": [
          {
            "text": "{{ $json.body.theme === 'fireman' ? 'INSTRUCTION: Create a high-fidelity, photorealistic 16:9 WIDESCREEN fireman portrait.\n\n1. SUBJECT: Use the pet from Image 2. This is the absolute identity lock. Preserve exact facial features, ear shape, and head tilt. Maintain the pet\'s unique characteristics and expression.\n\n2. STYLE & ENVIRONMENT: Use Image 1 as the master reference for the fireman aesthetic. Match the artistic style of Image 1 exactly: photorealistic rendering with professional photography quality, natural even lighting that highlights uniform details, professional portrait composition, color accuracy matching red/yellow tones and reflective materials from Image 1.\n\n3. COSTUME: Apply the fireman uniform and gear from Image 1 with complete accuracy: firefighter helmet with reflective visor, fire-resistant jacket/turnout coat with reflective stripes, matching pants and boots, any badges/patches/insignia visible in Image 1.\n\n4. ARTISTIC INTEGRATION: The pet must be fully integrated into the medium of Image 1. Match the texture, shadows, lighting, and overall aesthetic style exactly.\n\n5. WIDESCREEN COMPOSITION: Center the subject. Ensure a \"Cinematic Wide\" view with ample space on left and right sides.\n\n6. NO CLIPPING: Show the subject from head to waist. Ensure there is visible space/background at the bottom of the frame below the costume.\n\n7. NO EXTRA LIMBS: Terminate the render at the torso. Do not draw legs or paws.\n\n8. QUALITY: Output must be print-ready, high-resolution, with sharp details on the uniform, helmet, and pet\'s features.' : 'INSTRUCTION: Create a high-fidelity, photorealistic 16:9 WIDESCREEN spaceman portrait.\n\n1. SUBJECT: Use the pet from Image 2. This is the absolute identity lock. Preserve exact facial features, ear shape, and head tilt. Maintain the pet\'s unique characteristics and expression.\n\n2. STYLE & ENVIRONMENT: Use Image 1 as the master reference for the spaceman aesthetic. Match the artistic style of Image 1 exactly: photorealistic rendering with professional photography quality, lighting that matches Image 1 (studio lighting, space environment glow, or natural light), professional portrait composition, color accuracy matching white/silver tones, reflective surfaces, and any colored accents from Image 1.\n\n3. COSTUME: Apply the astronaut suit and gear from Image 1 with complete accuracy: space helmet with visor (reflective or clear as shown in Image 1), white/colored spacesuit with patches/mission badges/NASA insignia, gloves and boots matching the suit design, any equipment or details visible in Image 1.\n\n4. ARTISTIC INTEGRATION: The pet must be fully integrated into the medium of Image 1. Match the texture, shadows, lighting, and overall aesthetic style exactly.\n\n5. WIDESCREEN COMPOSITION: Center the subject. Ensure a \"Cinematic Wide\" view with ample space on left and right sides.\n\n6. NO CLIPPING: Show the subject from head to waist. Ensure there is visible space/background at the bottom of the frame below the costume.\n\n7. NO EXTRA LIMBS: Terminate the render at the torso. Do not draw legs or paws.\n\n8. QUALITY: Output must be print-ready, high-resolution, with sharp details on the suit, helmet, and pet\'s features.' }}"
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

## What Was Fixed

### ❌ Your Original (Broken)
```javascript
{
  "text": `INSTRUCTION: Create a high-fidelity 16:9 Widescreen ${$node["Webhook"].json.body.theme} portrait.
  ...
  "inline_data": {  // ❌ Wrong
    "mime_type": "image/jpeg",  // ❌ Wrong
    "data": $node["Extract theme"].json["data"]  // ❌ Wrong syntax
  }
}
```

### ✅ Corrected Version
```javascript
{
  "text": "{{ $json.body.theme === 'fireman' ? '...fireman prompt...' : '...spaceman prompt...' }}",  // ✅ Proper expression
  ...
  "inlineData": {  // ✅ camelCase
    "mimeType": "image/jpeg",  // ✅ camelCase
    "data": $('Extract theme').item.json.data  // ✅ Correct n8n syntax
  }
}
```

---

## Key Changes

1. ✅ **Removed backticks** - Used string concatenation with ternary operator
2. ✅ **Fixed node references** - `$('Extract theme')` instead of `$node["Extract theme"]`
3. ✅ **Fixed field names** - `inlineData` and `mimeType` (camelCase)
4. ✅ **Added safety settings** - Required for Gemini API
5. ✅ **Theme-specific prompts** - Different prompts for fireman vs spaceman
6. ✅ **Proper expression syntax** - `{{ }}` for template expressions

---

## Image Order (Confirmed)

- **Image 1** = Theme master (`Extract theme`) ✅
- **Image 2** = Pet photo (`Extract user image`) ✅

Your prompt correctly references them!

---

## Before Pasting

1. **Enable Expression mode** in GEMINI node JSON Body field (fx icon should be active)
2. **Clear the field** completely
3. **Paste the entire expression** above
4. **Save** the workflow
5. **Test** with both fireman and spaceman themes

---

## If Node Names Are Different

If your nodes are named differently, update these references:
- `$('Extract theme')` → your theme extract node name
- `$('Extract user image')` → your pet image extract node name

Example: If your theme node is named "Extract Theme Image", use:
```javascript
"data": $('Extract Theme Image').item.json.data
```
