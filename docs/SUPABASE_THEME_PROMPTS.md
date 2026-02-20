# Supabase Theme Prompts - Dynamic Theme Management

## Overview

Theme prompts are now stored in Supabase, allowing you to:
- ✅ Add new themes without code changes
- ✅ Update prompts dynamically
- ✅ Manage themes alongside theme images in one place
- ✅ Version prompts with `updated_at` timestamp

---

## Database Schema

### Table: `theme_prompts`

```sql
create table public.theme_prompts (
  id uuid primary key default gen_random_uuid(),
  theme_name text not null unique,
  prompt text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  active boolean not null default true
);
```

**Columns:**
- `id` - UUID primary key
- `theme_name` - Unique theme identifier (e.g., "fireman", "spaceman")
- `prompt` - Full prompt text for Gemini API
- `created_at` - When the prompt was created
- `updated_at` - Auto-updated on changes
- `active` - Whether the theme is currently active

**Security:**
- Public read access for active prompts (anon users)
- Authenticated users can read all and insert/update

---

## Setup Instructions

### Step 1: Create the Table

Run in Supabase SQL Editor:

```bash
supabase/run-create-theme-prompts-table.sql
```

This creates:
- `theme_prompts` table
- RLS policies (public read for active, authenticated write)
- Auto-update trigger for `updated_at`

### Step 2: Seed Initial Prompts

Run in Supabase SQL Editor:

```bash
supabase/run-seed-theme-prompts.sql
```

This inserts prompts for:
- `fireman`
- `spaceman`

---

## Adding a New Theme

### 1. Upload Theme Image to Supabase Storage

```bash
# Upload to: images/themes/{theme-name}-master.png
# Example: images/themes/pirate-master.png
```

### 2. Insert Prompt into Database

Run in Supabase SQL Editor:

```sql
insert into public.theme_prompts (theme_name, prompt, active)
values (
  'pirate',
  'INSTRUCTION: Create a high-fidelity, photorealistic 16:9 WIDESCREEN pirate portrait.

1. SUBJECT: Use the pet from Image 2. This is the absolute identity lock...
[your full prompt here]
',
  true
);
```

### 3. Update Frontend (Optional)

If you want the theme to appear in the UI:

**Update `lib/themes.ts`:**
```typescript
export const VALID_THEMES = ["fireman", "spaceman", "pirate"] as const
```

**Update `app/create/page.tsx`:**
- Add theme selection button
- Add preview image

**Update `app/api/create-portrait/route.ts`:**
- Add theme validation (or fetch from Supabase dynamically)

---

## Updating an Existing Prompt

### Option 1: Supabase Dashboard

1. Go to Supabase Dashboard → Table Editor
2. Open `theme_prompts` table
3. Find your theme row
4. Edit the `prompt` field
5. Save

The `updated_at` timestamp will auto-update.

### Option 2: SQL Editor

```sql
update public.theme_prompts
set prompt = 'INSTRUCTION: Create a high-fidelity... [new prompt]',
    updated_at = now()
where theme_name = 'fireman';
```

---

## Temporarily Disable a Theme

```sql
update public.theme_prompts
set active = false
where theme_name = 'spaceman';
```

The API will fall back to default prompts if a theme is inactive or not found.

---

## How It Works

### API Flow

1. **User selects theme** → Frontend sends `theme` to `/api/create-portrait`
2. **API fetches prompt** → `getPromptForTheme(theme)` queries Supabase
3. **Prompt sent to n8n** → Included in webhook payload
4. **n8n uses prompt** → GEMINI node receives `{{ $json.body.prompt }}`

### Code Flow

```typescript
// lib/theme-prompts.ts
export async function getPromptForTheme(theme: string): Promise<string> {
  // 1. Query Supabase for active prompt
  const { data } = await supabase
    .from("theme_prompts")
    .select("prompt")
    .eq("theme_name", theme)
    .eq("active", true)
    .single()
  
  // 2. Return prompt or fallback to default
  return data?.prompt || getDefaultPrompt(theme)
}
```

### Fallback Behavior

If Supabase is unavailable or theme not found:
- ✅ Falls back to hardcoded default prompts
- ✅ Logs error for debugging
- ✅ Service continues to work

---

## Benefits

### ✅ Dynamic Updates
- Update prompts without code deployment
- Test prompt changes instantly
- No need to redeploy for prompt tweaks

### ✅ Centralized Management
- Prompts and theme images in one place (Supabase)
- Easy to see all themes at a glance
- Version history via `updated_at`

### ✅ Scalability
- Add unlimited themes without code changes
- Enable/disable themes dynamically
- Easy to A/B test different prompts

### ✅ Reliability
- Fallback to defaults if Supabase unavailable
- Error handling and logging
- No breaking changes if database is down

---

## Query Examples

### Get All Active Themes

```sql
select theme_name, updated_at
from public.theme_prompts
where active = true
order by theme_name;
```

### Get Prompt for Specific Theme

```sql
select prompt
from public.theme_prompts
where theme_name = 'fireman'
  and active = true;
```

### See When Prompts Were Last Updated

```sql
select theme_name, updated_at, created_at
from public.theme_prompts
order by updated_at desc;
```

---

## Troubleshooting

### Issue: Prompt not found

**Check:**
1. Is theme name spelled correctly? (case-insensitive)
2. Is `active = true`?
3. Does the row exist in `theme_prompts`?

**Debug:**
```sql
select * from public.theme_prompts where theme_name = 'your-theme';
```

### Issue: API using fallback prompt

**Check:**
1. Supabase connection (check env vars)
2. RLS policies (anon should be able to read active prompts)
3. Check API logs for errors

**Test:**
```typescript
// Test in API route
const prompt = await getPromptForTheme('fireman')
console.log('Prompt:', prompt)
```

### Issue: Prompt not updating

**Check:**
1. Did you save the update?
2. Is cache cleared? (Supabase queries are fresh)
3. Check `updated_at` timestamp

---

## Migration from Codebase Prompts

If you previously had prompts in `lib/prompts.ts`:

1. ✅ **Already done**: Code now uses `lib/theme-prompts.ts` (Supabase)
2. ✅ **Fallback**: Default prompts still exist in code
3. ✅ **No breaking changes**: API works with or without Supabase

The old `lib/prompts.ts` file can be deleted (or kept as backup).

---

## Best Practices

1. **Test prompts before activating**
   - Insert with `active = false`
   - Test in staging
   - Set `active = true` when ready

2. **Version control prompts**
   - Keep prompt text in a doc/notes
   - Use `updated_at` to track changes
   - Consider adding a `version` field if needed

3. **Monitor prompt performance**
   - Track which prompts produce best results
   - A/B test different prompt variations
   - Update based on user feedback

4. **Keep fallback prompts updated**
   - Update defaults in `lib/theme-prompts.ts` if Supabase is down
   - Match database prompts for consistency
