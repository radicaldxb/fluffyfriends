-- ============================================================
-- RUN IN SUPABASE SQL EDITOR if inserts to pet_portraits fail
-- (e.g. storage updates work but table stays empty).
-- This allows the anon key (used by the API) to insert rows.
-- ============================================================

grant insert on public.pet_portraits to anon;

-- Drop if already exists (e.g. re-run), then create
drop policy if exists "pet_portraits_insert_anon" on public.pet_portraits;
create policy "pet_portraits_insert_anon"
  on public.pet_portraits
  for insert
  to anon
  with check (true);
