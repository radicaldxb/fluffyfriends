-- ============================================================
-- RUN ONCE in Supabase SQL Editor.
-- Adds original_image_url so /create can match the portrait to this upload
-- (avoids showing the wrong/latest portrait when multiple runs exist).
-- ============================================================

alter table public.pet_portraits add column if not exists original_image_url text;
