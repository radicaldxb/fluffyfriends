-- ============================================================
-- RUN IN SUPABASE SQL EDITOR when storage works but no row is added.
-- 1) Adds missing columns if your table was created from the old "posts" schema.
-- 2) Allows anon to insert (so the API can write rows).
-- ============================================================

-- 1. Add missing columns (no-op if they already exist)
alter table public.pet_portraits add column if not exists pet_name text;
alter table public.pet_portraits add column if not exists status text;
alter table public.pet_portraits add column if not exists user_email text;

-- If table still has old "title" column (from posts), allow null so insert without title works
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'pet_portraits' and column_name = 'title'
  ) then
    alter table public.pet_portraits alter column title drop not null;
  end if;
end $$;

-- 2. Allow anon to insert
grant insert on public.pet_portraits to anon;

drop policy if exists "pet_portraits_insert_anon" on public.pet_portraits;
create policy "pet_portraits_insert_anon"
  on public.pet_portraits
  for insert
  to anon
  with check (true);
