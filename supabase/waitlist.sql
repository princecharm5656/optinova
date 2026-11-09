-- OptiNova: email waitlist (run once in Supabase > SQL Editor). Safe to run again.

create table if not exists public.waitlist (
  id              uuid primary key default gen_random_uuid(),
  email           text not null unique check (char_length(email) <= 254),
  source          text default 'homepage' check (char_length(source) <= 40),
  referral_source text,
  created_at      timestamptz not null default now()
);

alter table public.waitlist enable row level security;

-- Visitors may ADD their email. Nobody can read the list from the website
-- (you read it in Supabase > Table Editor).
drop policy if exists "Anyone can join waitlist" on public.waitlist;
create policy "Anyone can join waitlist" on public.waitlist
  for insert with check (true);
