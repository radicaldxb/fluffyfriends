-- ============================================================
-- Add name-tag columns to theme_prompts for theme-level config
-- Run this once. Safe to run multiple times (uses IF NOT EXISTS / DO).
-- ============================================================

-- Add columns if they don't exist (PostgreSQL 9.5+)
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'theme_prompts' and column_name = 'has_name_tag'
  ) then
    alter table public.theme_prompts add column has_name_tag boolean not null default false;
  end if;
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'theme_prompts' and column_name = 'name_tag_instruction'
  ) then
    alter table public.theme_prompts add column name_tag_instruction text;
  end if;
end $$;

-- Set fireman as the first theme with name tag (and optional custom instruction)
-- name_tag_instruction is optional; if null, the app uses a default appendix
update public.theme_prompts
set has_name_tag = true,
    name_tag_instruction = 'Use the same rectangular chest name patch as in Image 1 (the one that says "Fire Dept."). Do not keep the original text "Fire Dept." on the chest patch. Overwrite it so the patch text reads exactly: "{{PET_NAME}}" and nothing else. Match its position, size, and embroidered style exactly, integrating it into the jacket fabric, folds, and lighting.',
    updated_at = now()
where theme_name = 'fireman';
