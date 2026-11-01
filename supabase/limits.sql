-- OptiNova: plan-aware daily limits (run once in Supabase > SQL Editor)
-- Replaces claim_usage() from usage.sql. Free users get the lower limit; users with an
-- ACTIVE 'pro' or 'teams' row in user_subscriptions get the higher one.
-- To change limits later, edit the numbers and run this whole block again.

drop function if exists public.claim_usage(text);

create or replace function public.claim_usage(p_kind text)
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
    select 1 from public.user_subscriptions
    where user_id = uid and status = 'active' and plan in ('pro', 'teams')
  ) into v_paid;

  lim := case p_kind
           when 'magic' then case when v_paid then 100 else 10 end   -- blueprints / 24h
           when 'image' then case when v_paid then 600 else 60 end   -- images / 24h
           when 'tool'  then case when v_paid then 400 else 40 end   -- caption, bio, blog... / 24h
           else 0
         end;

  if lim = 0 then
    return query select false, 0, 0, 0, v_paid;
    return;
  end if;

  perform pg_advisory_xact_lock(hashtext(uid::text || p_kind));

  select count(*) into cnt
  from public.app_usage
  where user_id = uid and kind = p_kind and created_at > now() - interval '24 hours';

  if cnt >= lim then
    return query select false, cnt, 0, lim, v_paid;
    return;
  end if;

  insert into public.app_usage (user_id, kind) values (uid, p_kind);
  return query select true, cnt + 1, lim - (cnt + 1), lim, v_paid;
end;
$$;

revoke all on function public.claim_usage(text) from public, anon;
grant execute on function public.claim_usage(text) to authenticated;
