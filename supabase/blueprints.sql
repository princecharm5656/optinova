-- OptiNova: saved blueprints + Next Moves progress (run once in Supabase > SQL Editor)

create table if not exists public.blueprints (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  prompt     text not null check (char_length(prompt) <= 500),
  title      text,
  data       jsonb not null check (pg_column_size(data) < 100000),
  done       jsonb not null default '{}'::jsonb check (pg_column_size(done) < 2000),
  created_at timestamptz not null default now()
);

create index if not exists blueprints_user_time on public.blueprints (user_id, created_at desc);

alter table public.blueprints enable row level security;

drop policy if exists "read own blueprints"   on public.blueprints;
drop policy if exists "insert own blueprints" on public.blueprints;
drop policy if exists "update own blueprints" on public.blueprints;
drop policy if exists "delete own blueprints" on public.blueprints;

create policy "read own blueprints"   on public.blueprints for select using (auth.uid() = user_id);
create policy "insert own blueprints" on public.blueprints for insert with check (auth.uid() = user_id);
create policy "update own blueprints" on public.blueprints for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "delete own blueprints" on public.blueprints for delete using (auth.uid() = user_id);

-- Logged-out visitors get nothing. Logged-in users may only change the checklist
-- progress column ("done") after a blueprint is saved, never the blueprint itself.
revoke all on public.blueprints from anon;
revoke update on public.blueprints from authenticated;
grant update (done) on public.blueprints to authenticated;
