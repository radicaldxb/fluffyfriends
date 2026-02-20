# Supabase Theme Prompts - Quick Setup Guide

## Step-by-Step Setup

### 1. Create the Table

In Supabase Dashboard → SQL Editor, run:

```sql
-- Copy contents of: supabase/run-create-theme-prompts-table.sql
```

Or run the file directly if you have Supabase CLI:
```bash
supabase db execute -f supabase/run-create-theme-prompts-table.sql
```

### 2. Seed Initial Prompts

In Supabase Dashboard → SQL Editor, run:

```sql
-- Copy contents of: supabase/run-seed-theme-prompts.sql
```

Or:
```bash
supabase db execute -f supabase/run-seed-theme-prompts.sql
```

### 3. Verify Setup

Check that prompts were inserted:

```sql
select theme_name, length(prompt) as prompt_length, active, updated_at
from public.theme_prompts
order by theme_name;
```

You should see:
- `fireman` - active, with prompt text
- `spaceman` - active, with prompt text

### 4. Test API

The API will automatically fetch prompts from Supabase. Test by:
1. Creating a portrait with theme "fireman"
2. Check API logs to confirm prompt is fetched
3. Verify prompt is sent to n8n webhook

---

## Adding a New Theme

### Complete Workflow

1. **Upload theme image** to Supabase Storage:
   ```
   images/themes/{theme-name}-master.png
   ```

2. **Insert prompt** into database:
   ```sql
   insert into public.theme_prompts (theme_name, prompt, active)
   values ('pirate', 'INSTRUCTION: Create...', true);
   ```

3. **Update frontend** (optional):
   - Add to `VALID_THEMES` in `lib/themes.ts`
   - Add theme selection button in `app/create/page.tsx`

4. **Test** the new theme!

---

## Quick Reference

### Update a Prompt

```sql
update public.theme_prompts
set prompt = 'New prompt text here',
    updated_at = now()
where theme_name = 'fireman';
```

### Disable a Theme

```sql
update public.theme_prompts
set active = false
where theme_name = 'spaceman';
```

### Enable a Theme

```sql
update public.theme_prompts
set active = true
where theme_name = 'spaceman';
```

### View All Themes

```sql
select theme_name, active, updated_at, length(prompt) as prompt_length
from public.theme_prompts
order by theme_name;
```
