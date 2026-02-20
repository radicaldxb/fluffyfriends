# Prompt Storage: Codebase vs n8n - Maintenance Comparison

## Recommendation: **Store in Codebase** ✅

**Winner: Codebase** - Better for long-term maintainability, version control, and collaboration.

---

## Comparison Table

| Factor | Codebase (Recommended) | n8n Nodes |
|--------|----------------------|-----------|
| **Version Control** | ✅ Full Git history, diffs, rollback | ❌ Only if you export workflow JSON |
| **Editing Experience** | ✅ IDE with syntax highlighting, search/replace | ❌ Web UI, long strings, no highlighting |
| **Testing** | ✅ Can test locally, validate before deploy | ⚠️ Must test in production n8n |
| **Collaboration** | ✅ Multiple devs, PR reviews, code review | ❌ Manual coordination, no review process |
| **Documentation** | ✅ Comments, JSDoc, separate files | ❌ Hard to document in n8n |
| **Consistency** | ✅ Same prompts across dev/staging/prod | ⚠️ Must manually sync environments |
| **Deployment** | ⚠️ Requires redeploy (but automated) | ✅ Instant updates |
| **Error Prevention** | ✅ TypeScript validation, linting | ❌ No validation |
| **Maintainability** | ✅ Easy to find, update, refactor | ❌ Harder to maintain long-term |

---

## Detailed Analysis

### ✅ Codebase Storage (Recommended)

**Pros:**
1. **Version Control**: Every change is tracked in Git
   - See who changed what and when
   - Easy rollback if something breaks
   - Can review changes in PRs

2. **Better Editing Experience**
   - Use your IDE (VS Code, Cursor)
   - Syntax highlighting for TypeScript/JSON
   - Find/replace across files
   - Multi-cursor editing
   - Auto-completion

3. **Testing & Validation**
   - Can validate prompts locally
   - TypeScript type checking
   - Linting (ESLint)
   - Unit tests possible

4. **Professional Workflow**
   - Code reviews before changes
   - CI/CD integration
   - Staging → Production flow
   - Same prompts across environments

5. **Documentation**
   - Add comments explaining prompt choices
   - Separate file for easy reading
   - Can version prompt templates

**Cons:**
- Requires redeployment to update (but Netlify auto-deploys on push)
- Need to coordinate code + n8n workflow

---

### ⚠️ n8n Node Storage

**Pros:**
- Quick updates without deployment
- Can test immediately

**Cons:**
1. **No Version Control**
   - Changes only exist in n8n
   - Can't see history of changes
   - Hard to rollback
   - If workflow is recreated, prompts might be lost

2. **Poor Editing Experience**
   - Web UI textarea (no syntax highlighting)
   - Long strings are hard to read/edit
   - No find/replace across prompts
   - Easy to make typos

3. **No Validation**
   - No TypeScript checking
   - No linting
   - Typos only discovered at runtime

4. **Harder Collaboration**
   - Can't review changes in PRs
   - Multiple people editing can conflict
   - No clear change history

5. **Environment Sync Issues**
   - Must manually update dev/staging/prod
   - Easy to have different prompts in different environments
   - No way to ensure consistency

---

## Recommended Implementation: Separate Prompts File

Create a dedicated file for prompts to keep them organized and easy to maintain:

### File Structure

```
lib/
  prompts.ts          # Theme-specific prompts
  prompts.json        # Alternative: JSON format
```

### Implementation Option 1: TypeScript File (Recommended)

**File: `lib/prompts.ts`**

```typescript
export const THEME_PROMPTS = {
  fireman: `INSTRUCTION: Create a high-fidelity, photorealistic 16:9 WIDESCREEN fireman portrait.

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

8. QUALITY: Output must be print-ready, high-resolution, with sharp details on the uniform, helmet, and pet's features.`,

  spaceman: `INSTRUCTION: Create a high-fidelity, photorealistic 16:9 WIDESCREEN spaceman portrait.

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

8. QUALITY: Output must be print-ready, high-resolution, with sharp details on the suit, helmet, and pet's features.`
} as const

export type Theme = keyof typeof THEME_PROMPTS

export function getPromptForTheme(theme: string): string {
  const normalizedTheme = theme.toLowerCase() as Theme
  return THEME_PROMPTS[normalizedTheme] || THEME_PROMPTS.fireman
}
```

**Update: `app/api/create-portrait/route.ts`**

```typescript
import { getPromptForTheme } from "@/lib/prompts"

// ... existing code ...

const payload = { 
  test_image: uploadUrl, 
  pet_name: petName, 
  name: petName, 
  theme: theme.toLowerCase(),
  prompt: getPromptForTheme(theme)  // Add this
}
```

**Update n8n GEMINI node:**

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

## Benefits of Codebase Storage

### 1. Easy Updates
```typescript
// Just edit lib/prompts.ts
export const THEME_PROMPTS = {
  fireman: `...updated prompt...`,
  // ...
}
```

### 2. Version Control
```bash
git log lib/prompts.ts  # See all changes
git diff lib/prompts.ts  # See what changed
git revert <commit>      # Rollback if needed
```

### 3. Code Review
- Team can review prompt changes in PRs
- Catch typos before deployment
- Discuss prompt improvements

### 4. Testing
```typescript
// Can test locally
import { getPromptForTheme } from "@/lib/prompts"
console.log(getPromptForTheme("fireman"))
```

### 5. Documentation
```typescript
/**
 * Theme-specific prompts for Gemini API
 * 
 * Each prompt guides the AI to:
 * - Match the master theme image style exactly
 * - Preserve pet identity from user photo
 * - Generate 16:9 widescreen portraits
 * - Avoid clipping and extra limbs
 */
export const THEME_PROMPTS = {
  // ...
}
```

---

## Migration Path

If you currently have prompts in n8n:

1. **Extract prompts** from n8n workflow
2. **Create `lib/prompts.ts`** with the prompts
3. **Update API route** to send `prompt` field
4. **Update n8n** to use `{{ $json.body.prompt }}`
5. **Test** with both themes
6. **Commit** to Git

---

## Final Recommendation

**Store prompts in codebase** (`lib/prompts.ts`) because:
- ✅ Better long-term maintainability
- ✅ Version control and history
- ✅ Easier editing and collaboration
- ✅ Professional development workflow
- ✅ Can test and validate before deploy

The only downside (requiring redeploy) is minimal since:
- Netlify auto-deploys on push
- You can test locally first
- Changes are reviewed before going live
