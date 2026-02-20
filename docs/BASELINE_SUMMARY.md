# Baseline Summary - Fluffyfriends Stable State

**Created:** February 20, 2026  
**Status:** ✅ Production-ready baseline

---

## What's Working

### Core Flow
✅ User uploads photo → API validates theme → Uploads to Supabase → Sends to n8n with prompt  
✅ n8n fetches images → Set node passes prompt → GEMINI generates → Callback stores result  
✅ Client polls Supabase → Portrait appears in gallery

### Theme System
✅ Themes stored in Supabase (`theme_prompts` table)  
✅ Prompts editable in database (no code changes)  
✅ Dynamic theme validation (API checks DB)  
✅ Dynamic theme list (`GET /api/themes`)  
✅ UI loads themes from API (`/create` page)

### Security
✅ Webhook secret protection (`N8N_WEBHOOK_SECRET`)  
✅ API key stored in n8n (not in code)  
✅ RLS policies on Supabase tables

### Error Handling
✅ Returns 503 when n8n fails (honest errors)  
✅ Fallback prompts if Supabase unavailable  
✅ Error IDs for tracking

---

## Key Files

### Application Code
- `app/api/create-portrait/route.ts` - Main upload endpoint
- `app/api/receive-n8n-image/route.ts` - n8n callback handler
- `app/api/themes/route.ts` - Theme list API
- `app/create/page.tsx` - Create page (dynamic themes)
- `lib/theme-prompts.ts` - Prompt fetching from Supabase
- `lib/themes.ts` - Theme utilities

### Database
- `supabase/run-create-theme-prompts-table.sql` - Creates `theme_prompts` table
- `supabase/run-seed-theme-prompts.sql` - Seeds initial prompts

### Documentation
- `docs/BASELINE_STATE.md` - Full architecture documentation
- `docs/ARCHITECTURE_REVIEW.md` - Architecture analysis
- `docs/SETUP_STEPS_CLEAR.md` - Setup instructions
- `docs/n8n-fluffyfriends-working.json` - n8n workflow reference

---

## Current n8n Workflow

**Structure:**
```
Webhook → [User image + Fetch Theme Image] → Extract → Merge → Set (adds prompt) → GEMINI → Convert → Supabase callback
```

**Key configuration:**
- GEMINI uses `$json.prompt` (from Set node)
- Images: `$('Extract theme').item.json.data` and `$('Extract user image').item.json.data`
- Supabase callback sends `X-Webhook-Secret` header

---

## Environment Variables

**Netlify (Required):**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `N8N_WEBHOOK_URL`

**Netlify (Optional):**
- `N8N_WEBHOOK_SECRET` - For callback security

---

## Database Tables

**`theme_prompts`**
- Stores theme-specific prompts
- Editable in Supabase (no code changes)
- `active` flag for enable/disable

**`pet_portraits`**
- Stores generated portraits
- Client polls this table

---

## Adding New Themes

1. Upload `{theme}-master.png` to Supabase Storage → `images/themes/`
2. `INSERT INTO theme_prompts (theme_name, prompt, active) VALUES (...)`
3. Add `{theme}-preview.webp` to `public/images/themes/` (optional, for UI)
4. Deploy (only if adding preview image)

**No code changes needed!**

---

## Next Development Cycle

This baseline is stable. Future enhancements:
- Job table for better status tracking
- Retry mechanism
- Rate limiting
- Analytics

---

## Quick Reference

- **Edit prompts:** Supabase → Table Editor → `theme_prompts` → Edit `prompt` field
- **Add theme:** DB insert + Storage upload + preview image
- **Check status:** Netlify Functions logs, n8n execution logs
- **Workflow:** `docs/n8n-fluffyfriends-working.json`
