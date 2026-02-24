-- Add theme-specific name patch instruction to fireman prompt.
-- The API replaces {{PET_NAME}} with the actual pet name when sending to n8n.
-- Run this once if you already have theme_prompts seeded and want the name-on-jacket instruction.

-- Add name patch instruction that references the master image (Image 1) chest patch "Fire Dept.".
-- Run once if you already have theme_prompts seeded without this instruction.
update public.theme_prompts
set prompt = prompt || E'\n\n9. NAME PATCH: Use the same rectangular chest name patch as in Image 1 (the one that says "Fire Dept."). Do not keep the original text "Fire Dept." on the chest patch. Overwrite it so the patch text reads exactly: "{{PET_NAME}}" and nothing else. Match its position, size, and embroidered style exactly, integrating it into the jacket fabric, folds, and lighting.',
    updated_at = now()
where theme_name = 'fireman'
  and prompt not like '%{{PET_NAME}}%';
