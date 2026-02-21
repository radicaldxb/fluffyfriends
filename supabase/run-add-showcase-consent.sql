-- Run in Supabase SQL Editor.
-- When true, portrait can be shown in public gallery. When false or null (legacy), we treat as not showable for strict consent.
alter table public.pet_portraits add column if not exists showcase_consent boolean default true;
