# n8n workflow: Theme selection

This doc explains how to update the n8n workflow to support theme selection (Fireman vs Spaceman).

## Current structure (single theme)

```
Webhook
  ↓
Edit Fields
  ↓
Download file (Fireman) → Master_Fireman → Merge (input 0)
HTTP Request (pet) → Extract from File → Merge (input 1)
  ↓
Merge → GEMINI → Convert to File → Supabase
```

## New structure (theme selection)

```
Webhook
  ↓
Edit Fields
  ↓
IF node (check $json.theme)
  ├─ "fireman" → Download file (Fireman) → Extract from File → Merge (input 0)
  └─ "spaceman" → Download file (Spaceman) → Extract from File → Merge (input 0)
HTTP Request (pet) → Extract from File → Merge (input 1)
  ↓
Merge → GEMINI → Convert to File → Supabase
```

---

## Step-by-step changes in n8n

### 1. Add IF node for theme selection

1. **Add an IF node** between "Edit Fields" and "Download file".
2. **Rename** "Download file" to **"Download Fireman"**.
3. **In the IF node:**
   - **Condition:** `{{ $json.theme }}`
   - **Value 1:** `fireman`
   - **Operation:** Equal
   - **Output:** True → connect to "Download Fireman"
   - **Output:** False → connect to new "Download Spaceman" node

### 2. Add Spaceman download node

1. **Add a Google Drive node** (same as Fireman):
   - **Operation:** Download file
   - **File ID:** `[SET_THIS_TO_SPACEMAN_FILE_ID]` (see `docs/THEME_FILES.md`)
   - **Binary Property Name:** `data`
   - **Credentials:** Same Google Service Account as Fireman
2. **Rename** it to **"Download Spaceman"**.
3. **Connect** IF node (False output) → Download Spaceman.
4. **Add Extract from File** after Download Spaceman:
   - **Operation:** binaryToProperty
   - **Connect** Download Spaceman → Extract from File (Spaceman) → Merge (input 0)

### 3. Update Extract from File for Fireman

1. **Add Extract from File** after "Download Fireman":
   - **Operation:** binaryToProperty
   - **Connect** Download Fireman → Extract from File (Fireman) → Merge (input 0)

### 4. Update GEMINI node reference

The GEMINI node currently references `$('Master_Fireman').item.json.data`. Change it to reference the **Merge node's first input** (which will be whichever theme ran):

**Old:**
```javascript
"data": "{{ $('Master_Fireman').item.json.data }}"
```

**New:**
```javascript
"data": "{{ $('Merge').item.json.data }}"
```

Or if Merge doesn't expose it directly, use the Extract from File node from the style branch. Since both branches now have Extract from File, you can reference whichever one ran. Actually, Merge combines both inputs, so input 0 (style) should be accessible. Try:

```javascript
"data": "{{ $('Merge').item.json.data }}"
```

If that doesn't work, you may need to use a Set node after Merge to combine the data, or reference the Extract from File node dynamically. In n8n, you can also use `$input.item.json.data` to reference the current item's data.

**Simplest:** Keep the Extract from File nodes named differently (e.g., "Extract Fireman", "Extract Spaceman") and reference them conditionally, OR use Merge's output structure. Test which works in your n8n version.

**Alternative approach:** After Merge, add a **Set node** that extracts the style image data from Merge's first input, then reference that Set node in GEMINI.

### 5. Update GEMINI prompt (optional)

The prompt currently says "fireman suit from Image 2". You can make it dynamic:

```javascript
"text": "INSTRUCTION: Create a high-fidelity, photorealistic VERTICAL PORTRAIT.\n1. SUBJECT: Use the pet from Image 1. Preserve exact facial features, ear shape, and head tilt.\n2. COSTUME: Use the costume/style from Image 2.\n3. COMPOSITION: Render a 'Portrait Headshot' terminated at the dog's mid-chest level. NO LEGS. Do not show paws or the lower body.\n4. DIMENSIONS: Force a vertical 2:3 aspect ratio. Even if Image 1 is rectangular, crop the dog's face into a vertical center frame."
```

Or keep it generic: "Apply the style from Image 2 to the pet in Image 1."

---

## Testing

1. **Test Fireman:** Submit from `/create` with theme "fireman" → should download Fireman file.
2. **Test Spaceman:** Submit with theme "spaceman" → should download Spaceman file.
3. **Check executions:** In n8n, verify the IF node routes correctly and both download nodes work.

---

## Notes

- **File IDs:** See `docs/THEME_FILES.md` for Google Drive file IDs.
- **Fallback:** If theme is missing or invalid, the API returns 400, so n8n won't receive invalid themes.
- **Adding themes:** To add more themes, add branches to the IF node (or use a Switch node) and add corresponding Download + Extract nodes.
