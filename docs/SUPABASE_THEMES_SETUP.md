# Setting up themes folder in Supabase Storage

## Step 1: Create the themes folder

In Supabase Dashboard:

1. Go to **Storage** → **images** bucket
2. Click **"New folder"** (or **"Create folder"**)
3. Name it: **`themes`**
4. Click **Create**

You should now see:
```
images/
  ├── generated/
  ├── uploads/
  └── themes/  ← New folder
```

---

## Step 2: Upload theme master images

1. **Open the `themes` folder** you just created
2. **Upload your theme images:**
   - Click **"Upload file"** or drag and drop
   - Upload: `fireman-master.jpg` (or `.webp`)
   - Upload: `spaceman-master.jpg` (or `.webp`)

**File naming:** Use `{theme-name}-master.{ext}` format:
- `fireman-master.png` (or `.jpg`, `.webp`)
- `spaceman-master.png` (or `.jpg`, `.webp`)
- `samurai-master.png` (future)

**Important:** Use the **same extension** for all theme files, or update the n8n URL expression to match each theme's extension.

---

## Step 3: Make files public

**Option A: Make individual files public**
1. Click on each file (e.g., `fireman-master.jpg`)
2. Click **"Make public"** or toggle the visibility setting
3. Copy the **public URL** (you'll see it after making it public)

**Option B: Run SQL policy (recommended)**
1. Go to **SQL Editor** in Supabase
2. Run **`supabase/run-allow-public-read-themes.sql`**
3. This makes all files in `themes/` publicly readable

---

## Step 4: Verify public URLs

After making files public, you should be able to access them at:

```
https://your-project-ref.supabase.co/storage/v1/object/public/images/themes/fireman-master.png
https://your-project-ref.supabase.co/storage/v1/object/public/images/themes/spaceman-master.png
```

(Change `.png` to match your actual file extension)

**Test:** Open these URLs in a browser — you should see the images.

---

## Troubleshooting

**"Folder not found" or can't create folder:**
- Make sure you're in the **`images`** bucket (not a different bucket)
- Some Supabase UIs require you to upload a file first, then the folder appears

**"File not public" or 403 error:**
- Run the SQL policy: `supabase/run-allow-public-read-themes.sql`
- Or manually make each file public via the file's settings

**"File not found" (404):**
- Check the file name matches exactly: `fireman-master.png` (case-sensitive, and extension must match)
- Verify you're in the `themes/` folder, not `themes/subfolder/`
- Ensure the extension in the URL matches your file (`.png`, `.jpg`, or `.webp`)

---

## Next steps

Once the `themes/` folder exists with public images:

1. ✅ Update n8n workflow to fetch from Supabase URLs (see `docs/THEME_STORAGE_MIGRATION.md`)
   - Use `.png` extension in the URL if your files are `.png`
2. ✅ Test that n8n can fetch the images (open the URLs in a browser first to verify)
3. ✅ Add more themes by uploading more `{theme}-master.png` files (or use consistent extension)
