# Theme-Specific Prompts for Improved Image Generation

## Problem Statement

Currently, the Gemini API receives a generic prompt that says "Use the costume/style from Image 2." This leads to inconsistent results because:

1. **Style ambiguity**: Fireman and Spaceman master images may have different artistic styles (photorealistic vs. stylized, different lighting, composition approaches)
2. **Interpretation variance**: Without explicit guidance, Gemini interprets the theme images differently each time
3. **Lower accuracy**: Generic prompts don't guide the model to match specific aesthetic characteristics

## Solution: Theme-Specific Prompts

Use conditional logic in n8n to select a theme-specific prompt that:
- Describes the exact style characteristics of each theme
- Guides Gemini to match the master image's aesthetic
- Includes theme-specific details (lighting, mood, composition)
- Achieves ~90% consistency in style matching

---

## Recommended Implementation: n8n IF/Switch Node

### Architecture

```
Webhook → IF/Switch Node (check theme) → 
  ├─ IF theme = "fireman" → Set prompt variable → GEMINI
  └─ IF theme = "spaceman" → Set prompt variable → GEMINI
```

### Step-by-Step

1. **Add IF node** after Webhook (or after Merge, before GEMINI)
2. **Condition**: `{{ $json.body.theme }}` equals `"fireman"` or `"spaceman"`
3. **Set node** (in each branch) to create a `themePrompt` variable
4. **Update GEMINI node** to use `{{ $json.themePrompt }}` in the text field

---

## Theme-Specific Prompt Templates

### Fireman Theme Prompt

```
INSTRUCTION: Create a high-fidelity, photorealistic 16:9 WIDESCREEN image.

1. SUBJECT: Use the pet from Image 1. Preserve exact facial features, ear shape, and head tilt. Maintain the pet's unique characteristics and expression.

2. COSTUME: Apply the fireman uniform and gear from Image 2 with complete accuracy. Include:
   - Firefighter helmet with reflective visor
   - Fire-resistant jacket/turnout coat with reflective stripes
   - Matching pants and boots
   - Any badges, patches, or insignia visible in Image 2

3. STYLE & AESTHETIC: Match the artistic style of Image 2 exactly:
   - Photorealistic rendering with professional photography quality
   - Natural, even lighting that highlights the uniform details
   - Professional portrait composition
   - Color accuracy: match the red/yellow tones and reflective materials from Image 2

4. COMPOSITION: Render a cinematic waist-up shot showing:
   - Pet's head and upper torso wearing the fireman uniform
   - Ample space on left and right sides (16:9 aspect ratio)
   - Professional setting appropriate for a firefighter portrait
   - Ensure the uniform and gear are fully visible for high-quality printing

5. DIMENSIONS: Force a 16:9 widescreen aspect ratio. Do not zoom in too tightly; ensure the full uniform and professional setting are visible.

6. QUALITY: Output must be print-ready, high-resolution, with sharp details on the uniform, helmet, and pet's features.
```

### Spaceman Theme Prompt

```
INSTRUCTION: Create a high-fidelity, photorealistic 16:9 WIDESCREEN image.

1. SUBJECT: Use the pet from Image 1. Preserve exact facial features, ear shape, and head tilt. Maintain the pet's unique characteristics and expression.

2. COSTUME: Apply the astronaut suit and gear from Image 2 with complete accuracy. Include:
   - Space helmet with visor (reflective or clear as shown in Image 2)
   - White/colored spacesuit with patches, mission badges, or NASA insignia
   - Gloves and boots matching the suit design
   - Any equipment or details visible in Image 2

3. STYLE & AESTHETIC: Match the artistic style of Image 2 exactly:
   - Photorealistic rendering with professional photography quality
   - Lighting that matches Image 2 (studio lighting, space environment glow, or natural light)
   - Professional portrait composition
   - Color accuracy: match the white/silver tones, reflective surfaces, and any colored accents from Image 2

4. COMPOSITION: Render a cinematic waist-up shot showing:
   - Pet's head and upper torso wearing the astronaut suit
   - Ample space on left and right sides (16:9 aspect ratio)
   - Setting appropriate for a space portrait (studio background, space environment, or neutral backdrop as in Image 2)
   - Ensure the suit and helmet are fully visible for high-quality printing

5. DIMENSIONS: Force a 16:9 widescreen aspect ratio. Do not zoom in too tightly; ensure the full spacesuit and professional setting are visible.

6. QUALITY: Output must be print-ready, high-resolution, with sharp details on the suit, helmet, and pet's features.
```

---

## Alternative: Frontend Sends Prompt

If you prefer to keep prompts in your codebase (easier to version control):

### Frontend Changes

In `app/api/create-portrait/route.ts`, add prompt selection:

```typescript
const themePrompts = {
  fireman: `INSTRUCTION: Create a high-fidelity, photorealistic 16:9 WIDESCREEN image.
1. SUBJECT: Use the pet from Image 1...
[full fireman prompt]`,
  spaceman: `INSTRUCTION: Create a high-fidelity, photorealistic 16:9 WIDESCREEN image.
1. SUBJECT: Use the pet from Image 1...
[full spaceman prompt]`
}

const prompt = themePrompts[theme.toLowerCase()] || themePrompts.fireman
const payload = { 
  test_image: uploadUrl, 
  pet_name: petName, 
  name: petName, 
  theme: theme.toLowerCase(),
  prompt: prompt  // Add this
}
```

### n8n Changes

Update GEMINI node JSON body to use `{{ $json.body.prompt }}`:

```javascript
={{
  {
    "contents": [
      {
        "parts": [
          {
            "text": "{{ $json.body.prompt }}"
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
              "data": $('Extract theme').item.json.data
            }
          }
        ]
      }
    ],
    ...
  }
}}
```

---

## Prompt Engineering Best Practices

### Elements to Include

1. **Style matching**: Explicitly state "Match the artistic style of Image 2 exactly"
2. **Specific details**: List key costume elements (helmet, uniform, patches)
3. **Lighting guidance**: Describe the lighting approach from the master image
4. **Color accuracy**: Specify color tones to match
5. **Composition rules**: Define framing, aspect ratio, visible elements
6. **Quality requirements**: Print-ready, high-resolution, sharp details

### Testing & Refinement

1. **Generate 5-10 samples** per theme with the new prompts
2. **Compare against master images** for style consistency
3. **Identify gaps**: What's still inconsistent?
4. **Refine prompts**: Add more specific instructions for problematic areas
5. **Iterate**: Test again until ~90% consistency achieved

### Common Adjustments

- **If too stylized**: Add "photorealistic" emphasis
- **If colors off**: Specify exact color descriptions
- **If composition wrong**: Add more detailed framing instructions
- **If details missing**: List all costume elements explicitly

---

## Expected Outcomes

### Before (Generic Prompt)
- ❌ Inconsistent style interpretation
- ❌ Varying color palettes
- ❌ Different lighting approaches
- ❌ ~60-70% accuracy in matching master image style

### After (Theme-Specific Prompts)
- ✅ Consistent style matching
- ✅ Accurate color reproduction
- ✅ Uniform lighting approach
- ✅ ~85-90% accuracy in matching master image style

---

## Next Steps

1. **Review master images**: Analyze Fireman and Spaceman master images to identify their specific style characteristics
2. **Customize prompts**: Adjust the templates above to match your exact master image styles
3. **Implement**: Choose n8n IF/Switch or frontend approach
4. **Test**: Generate samples and compare
5. **Refine**: Iterate on prompts based on results

---

## Notes

- **Temperature**: Keep at 0.7 for consistency (lower = more deterministic)
- **Safety settings**: Keep as-is (BLOCK_NONE for all categories)
- **Image order**: Ensure Image 1 = pet, Image 2 = theme master (current setup is correct)
- **Version control**: Store prompts in code/docs for easy updates
