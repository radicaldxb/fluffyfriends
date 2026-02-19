-- DO NOT RUN THIS IN SQL EDITOR if the table already exists.
-- This creates "posts". To rename posts -> pet_portraits, run
-- supabase/run-rename-posts-to-pet-portraits.sql instead.
--
-- Table: posts
-- id (UUID), created_at (timestamptz), title (text), image_url (text)
-- RLS: anyone can read; only authenticated users can insert

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  title text not null,
  image_url text
);

-- Enable Row Level Security
alter table public.posts enable row level security;

-- Policy: anyone (including anon) can read all posts
create policy "posts_select_all"
  on public.posts
  for select
  using (true);

-- Policy: only authenticated users can insert posts
create policy "posts_insert_authenticated"
  on public.posts
  for insert
  to authenticated
  with check (true);

-- Optional: grant usage so anon/authenticated can use the table with RLS
grant select on public.posts to anon;
grant select, insert on public.posts to authenticated;
