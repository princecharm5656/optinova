-- OptiNova: customer profile (run once in Supabase > SQL Editor)

create table if not exists public.profiles (
  user_id       uuid primary key default auth.uid() references auth.users(id) on delete cascade,
  full_name     text check (char_length(full_name)     <= 80),
  phone         text check (char_length(phone)         <= 30),
  country       text check (char_length(country)       <= 60),
  city          text check (char_length(city)          <= 60),
  address       text check (char_length(address)       <= 200),
  business_name text check (char_length(business_name) <= 80),
  about         text check (char_length(about)         <= 300),
  updated_at    timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "read own profile"   on public.profiles;
drop policy if exists "insert own profile" on public.profiles;
drop policy if exists "update own profile" on public.profiles;
drop policy if exists "delete own profile" on public.profiles;

create policy "read own profile"   on public.profiles for select using (auth.uid() = user_id);
create policy "insert own profile" on public.profiles for insert with check (auth.uid() = user_id);
create policy "update own profile" on public.profiles for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "delete own profile" on public.profiles for delete using (auth.uid() = user_id);

revoke all on public.profiles from anon;
