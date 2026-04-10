-- Petmaster DM outreach tracker. Run once in Supabase SQL Editor.
create table if not exists public.influencer_outreach (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  instagram_handle text not null,
  influencer_name text not null,
  pet_name text not null,
  followers integer,
  post_reference text,
  observation text,
  dm_sent_at timestamptz not null,
  accepted boolean not null default false,
  accepted_at timestamptz
);

create index if not exists influencer_outreach_created_at_idx
  on public.influencer_outreach (created_at desc);
