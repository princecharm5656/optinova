-- OptiNova: per-user usage limits (run once in Supabase > SQL Editor)

create table if not exists public.app_usage (
  id         bigint generated always as identity primary key,
  user_id    uuid not null references auth.users(id) on delete cascade,
  kind       text not null,
  created_at timestamptz not null default now()
);

create index if not exists app_usage_user_kind_time
  on public.app_usage (user_id, kind, created_at desc);

alter table public.app_usage enable row level security;

-- Users may only READ their own rows. No insert/update/delete policies exist,
-- so rows can only be created by claim_usage() below (users can't cheat the counter).
drop policy if exists "read own usage" on public.app_usage;
create policy "read own usage" on public.app_usage
  for select using (auth.uid() = user_id);

-- Atomically checks the rolling 24h limit and records one use.
-- Limits are hard-coded HERE (not passed in), so nobody can raise their own limit.
-- To change limits later, edit the numbers and run this block again.
create or replace function public.claim_usage(p_kind text)
returns table (allowed boolean, used int, remaining int, max_allowed int)
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  lim int;
  cnt int;
begin
  lim := case p_kind
           when 'magic' then 10   -- blueprints per 24 hours
           when 'image' then 60   -- images (incl. regenerates) per 24 hours
           else 0
         end;

  if uid is null or lim = 0 then
    return query select false, 0, 0, lim;
    return;
  end if;

  -- one request at a time per user, so two parallel requests can't both slip through
  perform pg_advisory_xact_lock(hashtext(uid::text || p_kind));

  select count(*) into cnt
  from public.app_usage
  where user_id = uid and kind = p_kind and created_at > now() - interval '24 hours';

  if cnt >= lim then
    return query select false, cnt, 0, lim;
    return;
  end if;

  insert into public.app_usage (user_id, kind) values (uid, p_kind);
  return query select true, cnt + 1, lim - (cnt + 1), lim;
end;
$$;

revoke all on function public.claim_usage(text) from public, anon;
grant execute on function public.claim_usage(text) to authenticated;
