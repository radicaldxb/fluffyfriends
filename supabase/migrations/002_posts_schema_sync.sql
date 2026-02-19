-- DO NOT RUN THIS IN SQL EDITOR if you already have posts or pet_portraits.
-- To only rename posts -> pet_portraits, run run-rename-posts-to-pet-portraits.sql instead.
--
-- Robust migration: drop any existing posts table/view and recreate with canonical schema.
-- Columns: id, created_at, image_url, pet_name, status, user_email

-- 1. Drop any view named posts, then the table. CASCADE removes dependent objects (policies, etc.).
drop view if exists public.posts cascade;
drop table if exists public.posts cascade;

-- 2. Create posts table with exact schema
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  image_url text,
  pet_name text,
  status text,
  user_email text
);

-- 3. Enable Row Level Security
alter table public.posts enable row level security;

-- 4. RLS policies: anyone can read; only authenticated users can insert
create policy "posts_select_all"
  on public.posts
  for select
  using (true);

create policy "posts_insert_authenticated"
  on public.posts
  for insert
  to authenticated
  with check (true);

-- 5. Grants
grant select on public.posts to anon;
grant select, insert on public.posts to authenticated;
