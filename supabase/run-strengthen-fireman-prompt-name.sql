-- Strengthen fireman name patch instruction to explicitly override "Fire Dept." text.
-- Use this if you already have a fireman prompt with {{PET_NAME}} but without the stricter wording.
-- Safe to run multiple times; guarded by WHERE clause.

update public.theme_prompts
set prompt = prompt || E'\n\nImportant: Do not keep the original text "Fire Dept." on the chest patch. Overwrite it so the patch text reads exactly: "{{PET_NAME}}" and nothing else.',
    updated_at = now()
where theme_name = 'fireman'
  and prompt like '%{{PET_NAME}}%'
  and prompt not like '%Do not keep the original text "Fire Dept."%';

