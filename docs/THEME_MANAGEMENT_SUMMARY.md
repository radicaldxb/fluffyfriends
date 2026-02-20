# Theme Management Summary - Supabase Approach

## ✅ Implementation Complete

Theme prompts are now stored in Supabase, enabling **dynamic theme management** without code changes.

---

## What Changed

### Before
- Prompts stored in codebase (`lib/prompts.ts`)
- Required code deployment to update prompts
- Hard to add new themes dynamically

### After
- Prompts stored in Supabase (`theme_prompts` table)
- Update prompts without code changes
- Add new themes by inserting database rows
- Prompts and theme images managed in one place

---

## Architecture

```
┌─────────────┐
│   Frontend  │ User selects theme
└──────┬──────┘
       │ POST /api/create-portrait
       │ { theme: "fireman" }
       ▼
┌─────────────────────┐
│  API Route          │
│  create-portrait    │
└──────┬──────────────┘
       │ 1. Fetch prompt from Supabase
       │    getPromptForTheme("fireman")
       ▼
┌─────────────────────┐
│  Supabase           │
│  theme_prompts      │
│  ┌───────────────┐  │
│  │ theme_name    │  │
│  │ prompt        │  │
│  │ active        │  │
│  └───────────────┘  │
└──────┬──────────────┘
       │ 2. Return prompt
       ▼
┌─────────────────────┐
│  API Route          │
│  create-portrait    │
└──────┬──────────────┘
       │ 3. Send to n8n webhook
       │    { theme, prompt, ... }
       ▼
┌─────────────────────┐
│  n8n Workflow       │
│  GEMINI Node        │
│  Uses: {{ $json.body.prompt }}
└─────────────────────┘
```

---

## Files Created/Updated

### New Files
- ✅ `supabase/run-create-theme-prompts-table.sql` - Creates table
- ✅ `supabase/run-seed-theme-prompts.sql` - Seeds initial prompts
- ✅ `lib/theme-prompts.ts` - Fetches prompts from Supabase
- ✅ `docs/SUPABASE_THEME_PROMPTS.md` - Full documentation
- ✅ `docs/SUPABASE_SETUP_STEPS.md` - Quick setup guide

### Updated Files
- ✅ `app/api/create-portrait/route.ts` - Fetches prompt from Supabase
- ✅ `types/database.ts` - Added ThemePrompt types

### Old Files (Can Remove)
- ⚠️ `lib/prompts.ts` - No longer used (kept as backup/fallback)

---

## Setup Checklist

- [ ] Run `supabase/run-create-theme-prompts-table.sql` in Supabase SQL Editor
- [ ] Run `supabase/run-seed-theme-prompts.sql` in Supabase SQL Editor
- [ ] Verify prompts exist: `SELECT * FROM theme_prompts;`
- [ ] Test API with fireman theme
- [ ] Test API with spaceman theme
- [ ] Verify prompts are sent to n8n webhook
- [ ] (Optional) Remove old `lib/prompts.ts` file

---

## Benefits

### ✅ Dynamic Updates
- Update prompts without code deployment
- Test changes instantly
- No redeploy needed for prompt tweaks

### ✅ Easy Theme Management
- Add themes by inserting database rows
- Enable/disable themes with `active` flag
- All themes visible in one table

### ✅ Centralized Storage
- Prompts and theme images both in Supabase
- Easy to see all themes at a glance
- Version tracking via `updated_at`

### ✅ Reliability
- Fallback to defaults if Supabase unavailable
- Error handling and logging
- Service continues working even if DB is down

---

## Usage Examples

### Add a New Theme

```sql
-- 1. Upload image: images/themes/pirate-master.png

-- 2. Insert prompt
insert into public.theme_prompts (theme_name, prompt, active)
values (
  'pirate',
  'INSTRUCTION: Create a high-fidelity pirate portrait...',
  true
);
```

### Update a Prompt

```sql
update public.theme_prompts
set prompt = 'New improved prompt...',
    updated_at = now()
where theme_name = 'fireman';
```

### Disable a Theme Temporarily

```sql
update public.theme_prompts
set active = false
where theme_name = 'spaceman';
```

---

## API Behavior

### Normal Flow
1. API receives request with `theme`
2. Queries Supabase: `SELECT prompt FROM theme_prompts WHERE theme_name = ? AND active = true`
3. Returns prompt from database
4. Sends prompt to n8n webhook

### Fallback Flow (if Supabase unavailable)
1. API receives request with `theme`
2. Supabase query fails
3. Falls back to hardcoded default prompts in `lib/theme-prompts.ts`
4. Logs error for debugging
5. Service continues working

---

## Next Steps

1. **Run SQL migrations** in Supabase
2. **Test** with existing themes (fireman, spaceman)
3. **Add new themes** as needed via SQL
4. **Monitor** prompt performance and iterate

---

## Documentation

- **Full Guide**: `docs/SUPABASE_THEME_PROMPTS.md`
- **Quick Setup**: `docs/SUPABASE_SETUP_STEPS.md`
- **n8n Update**: `docs/N8N_UPDATE_FOR_CODEBASE_PROMPTS.md` (still applies - n8n uses `{{ $json.body.prompt }}`)
