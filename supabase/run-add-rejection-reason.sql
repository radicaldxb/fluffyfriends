-- Run in Supabase SQL Editor.
-- Adds rejection_reason for when n8n validates the image and rejects (e.g. group photo, human, object).
alter table public.pet_portraits add column if not exists rejection_reason text;
