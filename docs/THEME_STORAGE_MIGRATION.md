# Theme storage migration: Google Drive → Supabase Storage

## Why migrate?

- **Reliability:** No Google Drive auth disconnects
- **Scalability:** Easy to add themes (just upload to Supabase)
- **Consistency:** Already using Supabase for uploads/generated images
- **Simplicity:** n8n uses HTTP Request (no credentials needed)

---

## Storage structure

**Supabase Storage bucket:** `images`  
**Theme images path:** `themes/{theme-name}-master.jpg`

**Examples:**
- `themes/fireman-master.png`
- `themes/spaceman-master.png`
- `themes/samurai-master.png` (future)

**Public URL format:**
```
https://{supabase-project}.supabase.co/storage/v1/object/public/images/themes/{theme-name}-master.png
```

For your project:
```
https://your-project-ref.supabase.co/storage/v1/object/public/images/themes/fireman-master.png
```

**Note:** Files use `.png` extension. If you upload `.jpg` or `.webp` files later, update the n8n URL expression accordingly.

---

## Step 1: Upload theme images to Supabase Storage

1. **In Supabase Dashboard:**
   - Go to **Storage** → **images** bucket
   - Create folder **`themes`** (or upload directly to `themes/`)
   - Upload your theme master images:
     - `fireman-master.jpg` (or `.webp`)
     - `spaceman-master.jpg` (or `.webp`)

2. **Make them public:**
   - Run **`supabase/run-allow-public-read-themes.sql`** in Supabase SQL Editor
   - Or manually: Storage → `images` → `themes/` → select file → **Make public**

---

## Step 2: Update n8n workflow

### Replace Google Drive download with HTTP Request

**Old structure:**
```
Edit Fields → Download file (Google Drive) → Master_Fireman → Merge
```

**New structure:**
```
Edit Fields → HTTP Request (fetch theme URL) → Extract from File → Merge
```

### Implementation in n8n

1. **Remove Google Drive nodes** (Download file, Master_Fireman, etc.)

2. **Add HTTP Request node** after Edit Fields:
   - **Method:** GET
   - **URL (Expression):**
     ```javascript
     ={{ `${process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project-ref.supabase.co'}/storage/v1/object/public/images/themes/${$json.theme}-master.png` }}
     ```
   - **Response Format:** File
   - **Name:** "Fetch Theme Image"
   
   **Note:** If your files use `.jpg` or `.webp`, change `.png` to match your file extension.

3. **Connect:** Edit Fields → Fetch Theme Image → Extract from File → Merge (input 0)

4. **Update GEMINI node** if it references `Master_Fireman`:
   - Change to reference the Extract from File node after Fetch Theme Image
   - Or reference Merge's first input (which will be the theme image)

### Dynamic theme selection

The HTTP Request URL builds from `$json.theme`:
- `theme: "fireman"` → fetches `.../themes/fireman-master.jpg`
- `theme: "spaceman"` → fetches `.../themes/spaceman-master.jpg`

**No IF/Switch node needed** — the URL is dynamic based on the theme value.

---

## Step 3: Update app (optional helper)

You can add a helper function to build theme URLs consistently:

```typescript
// lib/themes.ts (new file)
export function getThemeImageUrl(theme: string): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  return `${supabaseUrl}/storage/v1/object/public/images/themes/${theme}-master.jpg`
}
```

But n8n can build the URL directly from `$json.theme`, so this is optional.

---

## Step 4: Adding new themes

**Super simple now:**

1. **Upload** `{new-theme}-master.png` (or `.jpg`/`.webp`) to Supabase Storage → `images/themes/`
2. **Make it public** (or ensure public read policy covers it)
3. **Add theme to app:**
   - Update `app/create/page.tsx` theme list
   - Update `app/api/create-portrait/route.ts` validation
   - Add to `lib/themes.ts` → `VALID_THEMES` array
4. **Update n8n URL** if the new theme uses a different extension (e.g., `.jpg` instead of `.png`), or use a consistent extension for all themes.

No n8n workflow structure changes needed — the HTTP Request URL is dynamic.

---

## Benefits summary

| Aspect | Google Drive | Supabase Storage |
|--------|--------------|------------------|
| **Auth** | Service Account (can disconnect) | Public URLs (no auth) |
| **Add theme** | Upload to Drive + add n8n node | Upload to Supabase + add to app list |
| **Reliability** | Depends on Google auth | Always available |
| **n8n complexity** | Google Drive node + credentials | HTTP Request (no creds) |
| **Scalability** | Harder (need n8n changes) | Easy (just upload file) |

---

## Rollback

If you need to go back to Google Drive:
1. Keep the old Google Drive nodes disabled in n8n
2. Switch the HTTP Request node to disabled
3. Re-enable Google Drive nodes

But Supabase Storage is recommended for reliability and simplicity.
