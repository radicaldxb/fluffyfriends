# n8n workflow update: Google Drive → Supabase Storage

Step-by-step guide to replace Google Drive theme downloads with Supabase Storage HTTP requests.

---

## Current workflow structure

```
Webhook
  ↓
Edit Fields
  ↓
Download file (Google Drive - Fireman) → Master_Fireman → Merge (input 0)
HTTP Request (pet image) → Extract from File → Merge (input 1)
  ↓
Merge → GEMINI → Convert to File → Supabase
```

---

## New workflow structure (after update)

```
Webhook
  ↓
Edit Fields
  ↓
HTTP Request (fetch theme from Supabase) → Extract from File → Merge (input 0)
HTTP Request (pet image) → Extract from File → Merge (input 1)
  ↓
Merge → GEMINI → Convert to File → Supabase
```

**No IF node needed** — the URL is dynamic based on `$json.theme`.

---

## Step-by-step changes

### Step 1: Remove Google Drive nodes

1. **Delete or disable these nodes:**
   - "Download file" (Google Drive node for Fireman)
   - "Master_Fireman" (Extract from File node)
   - Any other Google Drive nodes for themes

2. **Disconnect them** from the workflow:
   - Remove connection from "Edit Fields" → "Download file"
   - Remove connection from "Download file" → "Master_Fireman"
   - Remove connection from "Master_Fireman" → "Merge"

---

### Step 2: Add HTTP Request node for theme image

1. **Add an HTTP Request node** after "Edit Fields"
2. **Configure it:**

   **Basic settings:**
   - **Name:** `Fetch Theme Image` ✅ (this is what you'll reference in GEMINI node)
   - **Method:** `GET`
   - **Response Format:** `File` (important — so Extract from File can process it)
   - **Put Output in Field:** Leave **default** (usually `data` or empty — n8n handles it automatically when Response Format is "File")

   **URL (Expression mode):**
   - Click the **expression toggle** (fx icon) next to the URL field
   - Paste this expression:
     ```javascript
     ={{ `${process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project-ref.supabase.co'}/storage/v1/object/public/images/themes/${$json.theme}-master.png` }}
     ```
   
   **Note:** If "Put Output in Field" is visible and you need to set it:
   - Leave it **empty/default** (n8n will use the standard binary property)
   - Or set it to `data` if your Extract from File node expects that property name
   
   **How it works:**
   - When `theme: "fireman"` → fetches `.../themes/fireman-master.png`
   - When `theme: "spaceman"` → fetches `.../themes/spaceman-master.png`
   - Dynamic based on the `theme` value from the webhook

3. **Connect:**
   - "Edit Fields" → "Fetch Theme Image"

---

### Step 3: Add Extract from File node

1. **Add an Extract from File node** after "Fetch Theme Image"
2. **Configure:**
   - **Operation:** `Extract from file to base64 string` (or `binaryToProperty` if that option exists)
   - **Name:** `Extract Theme Image` (or similar)
   - **Binary Property Name:** Leave default (usually `data`)

3. **Connect:**
   - "Fetch Theme Image" → "Extract Theme Image" → "Merge" (input 0)

---

### Step 4: Update GEMINI node reference

The GEMINI node currently references `$('Master_Fireman').item.json.data`. Update it to reference the Extract from File node:

**Find in GEMINI node → JSON body (Expression mode):**

**Old:**
```javascript
"data": "{{ $('Master_Fireman').item.json.data }}"
```

**New:**
```javascript
"data": "{{ $('Extract Theme Image').item.json.data }}"
```

Or if you named the Extract node differently, use that name. The node name must match exactly.

**Full GEMINI body example** (with updated reference):
```javascript
={{
  {
    "contents": [
      {
        "parts": [
          {
            "text": "Apply the style from Image 2 to the pet in Image 1. IDENTITY LOCK: Image 1. STYLE LOCK: Image 2. Output the result as a high-quality base64 image."
          },
          {
            "inlineData": {
              "mimeType": "image/jpeg",
              "data": "{{ $('Extract from File').item.json.data }}"
            }
          },
          {
            "inlineData": {
              "mimeType": "image/jpeg",
              "data": "{{ $('Extract Theme Image').item.json.data }}"
            }
          }
        ]
      }
    ],
    "safetySettings": [...],
    "generationConfig": { "temperature": 1.0 }
  }
}}
```

**Note:** 
- First `inlineData` = pet image (from "Extract from File" after HTTP Request for pet)
- Second `inlineData` = theme image (from "Extract Theme Image" after Fetch Theme Image)

---

### Step 5: Verify connections

Your workflow should look like:

```
Webhook
  ├─→ HTTP Request (pet) → Extract from File → Merge (input 1)
  └─→ Edit Fields → Fetch Theme Image → Extract Theme Image → Merge (input 0)
       ↓
       Merge → GEMINI → Convert to File → Supabase
```

**Merge inputs:**
- **Input 0:** Theme image (from Extract Theme Image)
- **Input 1:** Pet image (from Extract from File after pet HTTP Request)

---

## Testing

1. **Test Fireman:**
   - Submit from `/create` with theme "fireman"
   - Check n8n execution — "Fetch Theme Image" should fetch `fireman-master.png`
   - Verify GEMINI receives both images

2. **Test Spaceman:**
   - Submit with theme "spaceman"
   - "Fetch Theme Image" should fetch `spaceman-master.png`

3. **Check for errors:**
   - If "Fetch Theme Image" returns 404 → file not public or wrong URL
   - If GEMINI fails → check node references match your node names

---

## Troubleshooting

**"Fetch Theme Image" returns 404:**
- Verify file exists: open `https://your-project-ref.supabase.co/storage/v1/object/public/images/themes/fireman-master.png` in browser (replace `your-project-ref` with your actual Supabase project reference)
- Check file is public (run `supabase/run-allow-public-read-themes.sql`)
- Verify URL expression uses correct Supabase project URL

**"Extract Theme Image" has no data:**
- Ensure "Fetch Theme Image" Response Format is set to **File** (not JSON)
- Check "Extract Theme Image" Operation is `Extract from file to base64 string` (or `binaryToProperty`)

**GEMINI node error "data is not defined":**
- Verify node name in GEMINI expression matches your Extract node name exactly
- Check Extract node outputs `json.data` (should if Operation is `binaryToProperty`)

**Wrong theme image used:**
- Check `$json.theme` value in webhook payload (should be "fireman" or "spaceman")
- Verify URL expression builds correctly (test in n8n expression editor)

---

## Benefits after update

- ✅ No Google Drive credentials needed
- ✅ No auth disconnects
- ✅ Easy to add themes (just upload to Supabase)
- ✅ Simpler workflow (one HTTP Request instead of Google Drive + IF node)
