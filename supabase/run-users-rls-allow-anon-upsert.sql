-- ============================================================
-- RUN IN SUPABASE SQL EDITOR
-- Fixes: "new row violates row-level security policy (USING expression)
--        for table \"users\""
-- The app uses the anon key to upsert into users (insert or update
-- on conflict email). Anon needs INSERT, SELECT, and UPDATE.
-- ============================================================

-- Ensure table exists (optional; skip if you already have users)
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  full_name text,
  city text,
  country text,
  state text,
  newsletter_consent boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.users enable row level security;

-- Drop any existing policies that might restrict anon (adjust names if yours differ)
drop policy if exists "Allow anon insert" on public.users;
drop policy if exists "Allow anon select own" on public.users;
drop policy if exists "Allow anon select" on public.users;
drop policy if exists "Allow anon update" on public.users;
drop policy if exists "users_select_policy" on public.users;
drop policy if exists "users_insert_policy" on public.users;
drop policy if exists "users_update_policy" on public.users;

-- Anon: may insert any row (e.g. new user from success form)
create policy "users_anon_insert"
  on public.users for insert to anon
  with check (true);

-- Anon: may select any row (needed for upsert conflict check and .select('id'))
create policy "users_anon_select"
  on public.users for select to anon
  using (true);

-- Anon: may update any row (needed for upsert ON CONFLICT DO UPDATE)
create policy "users_anon_update"
  on public.users for update to anon
  using (true)
  with check (true);
