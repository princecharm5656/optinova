-- OptiNova: plan dates + daily limits (run this WHOLE file in Supabase > SQL Editor).
-- Safe to run again. It replaces the earlier limits.sql / usage.sql functions.
--
-- 1) Adds start / end dates to user_subscriptions, so a plan EXPIRES by itself.
-- 2) Existing active plans get an end date 30 days after they were last changed.
-- 3) A user counts as paid only while status = 'active' AND the end date is in the future.
--    The moment the date passes, limits drop to the Free numbers. No cron job is needed.
-- To change a limit, edit usage_limit() below and run the file again.

-- ---------- 1) plan dates ----------
alter table public.user_subscriptions
  add column if not exists started_at          timestamptz,
  add column if not exists current_period_end  timestamptz,
  add column if not exists billing_period      text;

alter table public.user_subscriptions drop constraint if exists user_subscriptions_billing_period_check;
alter table public.user_subscriptions
  add constraint user_subscriptions_billing_period_check
  check (billing_period is null or billing_period in ('monthly', 'yearly'));

update public.user_subscriptions set started_at = coalesce(started_at, created_at);

update public.user_subscriptions
set billing_period     = coalesce(billing_period, 'monthly'),
    current_period_end = coalesce(current_period_end, coalesce(updated_at, now()) + interval '30 days')
where status = 'active' and current_period_end is null;

-- ---------- 2) functions ----------
drop function if exists public.claim_usage(text);
drop function if exists public.usage_summary();
drop function if exists public.usage_limit(text, boolean);
drop function if exists public.is_paid();

-- Is the logged-in user on a running paid plan right now?
create function public.is_paid()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_subscriptions s
    where s.user_id = auth.uid()
      and s.status = 'active'
      and s.plan in ('pro', 'teams')
      and s.current_period_end is not null
      and s.current_period_end > now()
  );
$$;

create function public.usage_limit(p_kind text, p_paid boolean)
returns int
language sql
immutable
as $$
  select case p_kind
           when 'magic' then case when p_paid then 100 else 10 end   -- business blueprints / 24h
           when 'image' then case when p_paid then 600 else 60 end   -- images (incl. regenerates) / 24h
           when 'tool'  then case when p_paid then 400 else 40 end   -- caption, bio, blog... / 24h
           else 0
         end;
$$;

-- Atomically checks the rolling 24h limit and records one use.
create function public.claim_usage(p_kind text)
returns table (allowed boolean, used int, remaining int, max_allowed int, paid boolean)
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  v_paid boolean;
  lim int;
  cnt int;
begin
  if uid is null then
    return query select false, 0, 0, 0, false;
    return;
  end if;

  v_paid := public.is_paid();
  lim := public.usage_limit(p_kind, v_paid);
  if lim = 0 then
    return query select false, 0, 0, 0, v_paid;
    return;
  end if;

  perform pg_advisory_xact_lock(hashtext(uid::text || p_kind));

  select count(*) into cnt
  from public.app_usage u
  where u.user_id = uid and u.kind = p_kind and u.created_at > now() - interval '24 hours';

  if cnt >= lim then
    return query select false, cnt, 0, lim, v_paid;
    return;
  end if;

  insert into public.app_usage (user_id, kind) values (uid, p_kind);
  return query select true, cnt + 1, lim - (cnt + 1), lim, v_paid;
end;
$$;

-- Read-only: how much of each limit the logged-in user has used.
create function public.usage_summary()
returns table (kind text, used int, max_allowed int, paid boolean)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  v_paid boolean;
begin
  if uid is null then
    return;
  end if;

  v_paid := public.is_paid();

  return query
    select k.kind,
           (select count(*)::int from public.app_usage u
             where u.user_id = uid and u.kind = k.kind and u.created_at > now() - interval '24 hours'),
           public.usage_limit(k.kind, v_paid),
           v_paid
    from (values ('tool'), ('image'), ('magic')) as k(kind);
end;
$$;

revoke all on function public.is_paid()                    from public, anon;
revoke all on function public.usage_limit(text, boolean)   from public, anon;
revoke all on function public.claim_usage(text)            from public, anon;
revoke all on function public.usage_summary()              from public, anon;
grant execute on function public.is_paid()                  to authenticated;
grant execute on function public.usage_limit(text, boolean) to authenticated;
grant execute on function public.claim_usage(text)          to authenticated;
grant execute on function public.usage_summary()            to authenticated;
