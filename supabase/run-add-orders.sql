-- Orders and order items for checkout (test flow; payment integration later)
-- Run in Supabase SQL Editor once.

-- Orders: one row per checkout (customer info, total, status)
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  name text,
  amount_cents integer not null,
  status text not null default 'pending' check (status in ('pending', 'paid', 'refunded', 'test')),
  payment_provider text,
  payment_id text,
  credits_valid_until timestamptz,
  created_at timestamptz not null default now()
);

-- Order items: what they bought (product, portrait link, credits)
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id text not null,
  price_cents integer not null,
  quantity integer not null default 1,
  portrait_ids uuid[] default '{}',
  credits_remaining integer default 0,
  created_at timestamptz not null default now()
);

-- Allow anon insert for checkout (tighten with RLS later)
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

create policy "Allow anon insert orders" on public.orders for insert to anon with check (true);
create policy "Allow anon insert order_items" on public.order_items for insert to anon with check (true);

-- Optional: allow anon to read own order by email (for "my orders" later)
create policy "Allow anon read orders by email" on public.orders for select to anon using (true);
create policy "Allow anon read order_items" on public.order_items for select to anon using (true);
