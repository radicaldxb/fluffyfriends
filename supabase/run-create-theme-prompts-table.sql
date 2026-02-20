-- ============================================================
-- Create theme_prompts table for storing theme-specific prompts
-- This allows dynamic theme management without code changes
-- ============================================================

-- Create theme_prompts table
create table if not exists public.theme_prompts (
  id uuid primary key default gen_random_uuid(),
  theme_name text not null unique,
  prompt text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  active boolean not null default true
);

-- Create index for faster lookups
create index if not exists idx_theme_prompts_theme_name on public.theme_prompts(theme_name);
create index if not exists idx_theme_prompts_active on public.theme_prompts(active) where active = true;

-- Enable Row Level Security
alter table public.theme_prompts enable row level security;

-- Policy: anyone can read active prompts (anon access for API)
create policy "theme_prompts_select_active"
  on public.theme_prompts
  for select
  using (active = true);

-- Policy: authenticated users can read all prompts
create policy "theme_prompts_select_all_authenticated"
  on public.theme_prompts
  for select
  to authenticated
  using (true);

-- Policy: authenticated users can insert/update prompts
create policy "theme_prompts_insert_authenticated"
  on public.theme_prompts
  for insert
  to authenticated
  with check (true);

create policy "theme_prompts_update_authenticated"
  on public.theme_prompts
  for update
  to authenticated
  using (true);

-- Grants
grant select on public.theme_prompts to anon;
grant select, insert, update on public.theme_prompts to authenticated;

-- Create function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create trigger to auto-update updated_at
drop trigger if exists update_theme_prompts_updated_at on public.theme_prompts;
create trigger update_theme_prompts_updated_at
  before update on public.theme_prompts
  for each row
  execute function update_updated_at_column();
