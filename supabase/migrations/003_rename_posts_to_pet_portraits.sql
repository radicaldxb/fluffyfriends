-- Rename table: posts -> pet_portraits (safe to run even if already renamed)
-- RLS policies stay attached to the table; we rename them for consistency.

do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'posts'
  ) then
    alter table public.posts rename to pet_portraits;
    alter policy "posts_select_all" on public.pet_portraits rename to "pet_portraits_select_all";
    alter policy "posts_insert_authenticated" on public.pet_portraits rename to "pet_portraits_insert_authenticated";
  end if;
end $$;
