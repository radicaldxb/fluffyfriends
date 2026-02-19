-- Allow anon to insert into pet_portraits (for server-side API / n8n webhook).
-- The API uses the anon key; without this, RLS blocks the insert and only storage is updated.

grant insert on public.pet_portraits to anon;

drop policy if exists "pet_portraits_insert_anon" on public.pet_portraits;
create policy "pet_portraits_insert_anon"
  on public.pet_portraits
  for insert
  to anon
  with check (true);
