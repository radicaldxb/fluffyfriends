# Theme reference images

**Recommended:** Use **Supabase Storage** (see `docs/THEME_STORAGE_MIGRATION.md`). This doc covers Google Drive (legacy).

The n8n workflow can download theme reference images from Google Drive or Supabase Storage. Each theme has a master image file that Gemini uses as the style reference.

## Current themes

| Theme | Google Drive File ID | Node name in n8n | Status |
|-------|---------------------|------------------|--------|
| **Fireman** | `1G5bOB1ARpJ55XsNrkDlGu4qh47tc5W5T` | `Master_Fireman` | ✅ Active |
| **Spaceman** | `[TO_BE_SET]` | `Master_Spaceman` | ⚠️ Needs file ID |

## How to add a new theme

1. **Upload the master image** to Google Drive (same folder as Fireman).
2. **Copy the file ID** from the Drive URL (e.g. `https://drive.google.com/file/d/FILE_ID_HERE/view`).
3. **In n8n workflow:**
   - Add a new **Google Drive** node: **Download file** operation.
   - Set **File ID** to the new theme's file ID.
   - Set **Binary Property Name** to `data` (so Extract from File can read it).
   - Connect it to the **IF/Switch** node branch for that theme.
4. **Update this doc** with the new file ID.
5. **Update the app** to include the theme in the selection UI and API validation.

## n8n workflow structure

```
Webhook
  ↓
IF node (check $json.theme)
  ├─ "fireman" → Download file (Fireman) → Extract from File → Merge (input 0)
  └─ "spaceman" → Download file (Spaceman) → Extract from File → Merge (input 0)
```

Both branches merge into the same Merge node (input 0 = style image), then Merge combines with the pet image (input 1) and sends to GEMINI.
