-- OptiNova: daily limits, defined in ONE place (run this whole block in Supabase > SQL Editor).
-- Free users get the lower number; users with an ACTIVE 'pro' or 'teams' row in
-- user_subscriptions get the higher one. To change a limit, edit usage_limit() below and run again.
-- Replaces the earlier usage.sql / limits.sql functions.

drop function if exists public.claim_usage(text);
drop function if exists public.usage_summary();
drop function if exists public.usage_limit(text, boolean);

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
  v_paid boolean := false;
  lim int;
  cnt int;
begin
  if uid is null then
    return query select false, 0, 0, 0, false;
    return;
  end if;

  select exists (
    select 1 from public.user_subscriptions s
    where s.user_id = uid and s.status = 'active' and s.plan in ('pro', 'teams')
  ) into v_paid;

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

-- Read-only: how much of each limit the logged-in user has used (for the dashboard / account page).
create function public.usage_summary()
returns table (kind text, used int, max_allowed int, paid boolean)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  v_paid boolean := false;
begin
  if uid is null then
    return;
  end if;

  select exists (
    select 1 from public.user_subscriptions s
    where s.user_id = uid and s.status = 'active' and s.plan in ('pro', 'teams')
  ) into v_paid;

  return query
    select k.kind,
           (select count(*)::int from public.app_usage u
             where u.user_id = uid and u.kind = k.kind and u.created_at > now() - interval '24 hours'),
           public.usage_limit(k.kind, v_paid),
           v_paid
    from (values ('tool'), ('image'), ('magic')) as k(kind);
end;
$$;

revoke all on function public.usage_limit(text, boolean) from public, anon;
revoke all on function public.claim_usage(text)          from public, anon;
revoke all on function public.usage_summary()            from public, anon;
grant execute on function public.usage_limit(text, boolean) to authenticated;
grant execute on function public.claim_usage(text)          to authenticated;
grant execute on function public.usage_summary()            to authenticated;
