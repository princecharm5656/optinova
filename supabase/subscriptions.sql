-- OptiNova: subscriptions table (run once in Supabase > SQL Editor)
-- Only the server (admin routes, using the service key) can write to it.

create table if not exists public.user_subscriptions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null unique references auth.users(id) on delete cascade,
  plan       text not null default 'free'   check (plan in ('free', 'pro', 'teams')),
  status     text not null default 'active' check (status in ('active', 'canceled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_subscriptions enable row level security;

-- A logged-in user may read ONLY their own subscription row.
-- There are no insert/update/delete policies, so nobody can upgrade themselves from the browser.
drop policy if exists "read own subscription" on public.user_subscriptions;
create policy "read own subscription" on public.user_subscriptions
  for select using (auth.uid() = user_id);

revoke all on public.user_subscriptions from anon;
revoke insert, update, delete on public.user_subscriptions from authenticated;
