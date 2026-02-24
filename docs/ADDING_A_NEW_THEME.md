# Adding a new theme (with or without name tag)

This guide explains how to add a new theme so it’s easy to adopt and adjust, including optional name-tag support. Name-tag behaviour is **configured per theme** in the database and used by both the API and (optionally) n8n.

## 1. Database: theme_prompts

The app uses **Supabase `theme_prompts`** as the source of truth for active themes, prompts, and name-tag config.

- **Run the name-tag columns migration once** (if you haven’t already):
  - `supabase/run-add-theme-nametag-columns.sql`  
  This adds `has_name_tag` and `name_tag_instruction` to `theme_prompts`.

- **Insert (or update) your new theme** in `theme_prompts`:
  - `theme_name` – e.g. `'fireman'`, `'spaceman'`, `'pilot'`
  - `prompt` – full Gemini instruction (see existing themes or `run-seed-theme-prompts.sql`)
  - `active` – `true`
  - `has_name_tag` – `true` if this theme should show the pet name on the costume (e.g. chest patch, mission badge); otherwise `false`
  - `name_tag_instruction` – optional. If the theme has a name tag and you want a **custom** instruction (e.g. “chest patch that says …”), set it here and include `{{PET_NAME}}`. If `null`, the app uses a generic default (see `lib/themes.ts` → `DEFAULT_NAMETAG_INSTRUCTION`).

Example (new theme with name tag, custom instruction):

```sql
insert into public.theme_prompts (theme_name, prompt, active, has_name_tag, name_tag_instruction)
values (
  'pilot',
  'INSTRUCTION: Create a high-fidelity, photorealistic 16:9 WIDESCREEN pilot portrait...',
  true,
  true,
  'Add a wing name patch on the left chest as in Image 1. The patch must read exactly: "{{PET_NAME}}". Match position, size, and embroidered style.'
)
on conflict (theme_name) do update set
  prompt = excluded.prompt,
  active = excluded.active,
  has_name_tag = excluded.has_name_tag,
  name_tag_instruction = excluded.name_tag_instruction,
  updated_at = now();
```

Example (new theme **without** name tag):

```sql
insert into public.theme_prompts (theme_name, prompt, active, has_name_tag)
values ('spaceman', '...', true, false)
on conflict (theme_name) do update set ...
```

After this, the **create-portrait API** will:
- Validate the theme against active themes from the DB.
- Fetch prompt + `has_name_tag` + `name_tag_instruction`.
- If `has_name_tag` is true and the prompt doesn’t contain `{{PET_NAME}}`, append “9. NAME PATCH:” plus `name_tag_instruction` or the default.
- Replace `{{PET_NAME}}` with the pet name and send **`theme_has_nametag`** in the webhook payload.

No code change is required in the app for a new theme; the UI and API both use active themes from the DB.

## 2. Theme reference image (n8n / Supabase Storage)

- **Supabase Storage:** Upload the theme’s master reference image to the `images/themes` bucket, e.g. `pilot-master.png`. See **THEME_STORAGE_MIGRATION.md** / **THEME_FILES.md**.
- **n8n:** Add a branch for the new theme (e.g. IF/Switch on `body.theme` → download that theme’s image → merge into the same flow as existing themes). Use the same pattern as fireman/spaceman.

## 3. n8n: name-tag branch (optional)

If you use a **Cloudinary (or other) name-tag overlay** in n8n only for some themes:

- **Prefer branching on `body.theme_has_nametag`** instead of `body.theme === 'fireman'`. That way, when you add a new theme with `has_name_tag = true` in the DB, n8n will automatically send that theme down the “name tag” path without editing the workflow.
- If you need different overlay positions per theme, you can still branch on `body.theme` inside the “name tag” branch, or use a small lookup.

See **CLOUDINARY_NAMETAG_STEP_BY_STEP.md** for the Cloudinary node setup; update the IF condition to use `body.theme_has_nametag`.

## 4. UI (theme selector)

The create page theme list is driven by **active themes from the API** (e.g. `GET /api/themes` or the same source used by create-portrait). Once the new theme is active in `theme_prompts`, it should appear in the selector. If your UI uses a static list, switch it to use the themes returned by the API.

## Summary

| Step | What to do |
|------|------------|
| 1 | Run `run-add-theme-nametag-columns.sql` once if not done. |
| 2 | Insert/update the theme in `theme_prompts` with `prompt`, `active`, `has_name_tag`, and optionally `name_tag_instruction`. |
| 3 | Upload theme master image (e.g. Supabase Storage) and add the theme branch in n8n. |
| 4 | In n8n, use `body.theme_has_nametag` for the name-tag vs no-name-tag branch. |
| 5 | Ensure theme selector uses active themes from the API. |

This keeps adding and adjusting themes (including name tags) in one place (the DB) and makes it easy to adopt the same name-tag behaviour for new themes by setting `has_name_tag` and optionally `name_tag_instruction`.
