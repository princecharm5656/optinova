import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { describeSubscription, type SubInfo } from "@/lib/subscription";

export type UsageKind = "magic" | "image" | "tool";

export type Claim =
  | { ok: true; remaining: number; limit: number }
  | { ok: false; status: 401 | 429 | 503; error: string };

const withTimeout = <T,>(p: Promise<T>, ms: number): Promise<T | null> =>
  Promise.race([p, new Promise<null>((resolve) => setTimeout(() => resolve(null), ms))]);

/**
 * 1) Verifies the user is logged in (server-side, can't be faked with a cookie).
 * 2) Atomically claims one use from the daily limit (see supabase/usage.sql).
 */
export async function requireLoginAndClaim(kind: UsageKind): Promise<Claim> {
  try {
    const supabase = await createClient();

    const res = await withTimeout(supabase.auth.getUser(), 6000);
    if (!res) return { ok: false, status: 503, error: "Login service is not responding. Please try again in a moment." };

    const { data, error } = res;
    if (!data.user) {
      if (error && (error.status === 0 || /fetch/i.test(error.message))) {
        return { ok: false, status: 503, error: "Login service is not reachable right now. Please try again." };
      }
      return { ok: false, status: 401, error: "Please log in to use this feature." };
    }

    const { data: rows, error: rpcError } = await supabase.rpc("claim_usage", { p_kind: kind });
    if (rpcError) {
      console.error("[usage] claim_usage failed:", rpcError.code, rpcError.message);
      const notSetUp = rpcError.code === "PGRST202";
      return {
        ok: false,
        status: 503,
        error: notSetUp
          ? "Usage tracking is not set up yet. Run supabase/usage.sql in the Supabase SQL Editor."
          : "Could not check your usage limit. Please try again.",
      };
    }

    const row = Array.isArray(rows) ? rows[0] : rows;
    if (!row?.allowed) {
      return {
        ok: false,
        status: 429,
        error: row?.paid
          ? `Daily limit reached (${row?.max_allowed ?? "?"} per 24 hours). Please try again later.`
          : `Daily limit reached (${row?.max_allowed ?? "?"} per 24 hours). Upgrade to Pro for much higher limits, or try again later.`,
      };
    }
    return { ok: true, remaining: row.remaining, limit: row.max_allowed };
  } catch (e: any) {
    console.error("[usage] unexpected:", e?.message || e);
    return { ok: false, status: 503, error: "Something went wrong checking your account. Please try again." };
  }
}

/** One-liner for API routes: returns an error response to send, or null if the caller may proceed. */
export async function guardTool(kind: UsageKind = "tool"): Promise<NextResponse | null> {
  const claim = await requireLoginAndClaim(kind);
  return claim.ok ? null : NextResponse.json({ error: claim.error }, { status: claim.status });
}

export type UsageSummary =
  | { ok: true; paid: boolean; items: { kind: UsageKind; used: number; max: number; remaining: number }[] }
  | { ok: false; status: 401 | 503; error: string };

/** Login check only (does NOT spend any of the daily limit). */
export async function requireLogin(): Promise<{ ok: true } | { ok: false; status: 401 | 503; error: string }> {
  try {
    const supabase = await createClient();
    const res = await withTimeout(supabase.auth.getUser(), 6000);
    if (!res) return { ok: false, status: 503, error: "Login service is not responding. Please try again in a moment." };
    if (!res.data.user) {
      if (res.error && (res.error.status === 0 || /fetch/i.test(res.error.message))) {
        return { ok: false, status: 503, error: "Login service is not reachable right now. Please try again." };
      }
      return { ok: false, status: 401, error: "Please log in to use this feature." };
    }
    return { ok: true };
  } catch (e: any) {
    console.error("[usage] requireLogin:", e?.message || e);
    return { ok: false, status: 503, error: "Something went wrong checking your account. Please try again." };
  }
}

/** How much of each daily limit the logged-in user has used. Read-only. */
export async function getUsageSummary(): Promise<UsageSummary> {
  const login = await requireLogin();
  if (!login.ok) return login;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("usage_summary");
    if (error) {
      console.error("[usage] usage_summary failed:", error.code, error.message);
      return {
        ok: false,
        status: 503,
        error: error.code === "PGRST202"
          ? "Usage tracking is not set up yet. Run supabase/limits.sql in the Supabase SQL Editor."
          : "Could not load your usage. Please try again.",
      };
    }
    const rows = (Array.isArray(data) ? data : []) as { kind: UsageKind; used: number; max_allowed: number; paid: boolean }[];
    return {
      ok: true,
      paid: rows.some((r) => r.paid),
      items: rows.map((r) => ({ kind: r.kind, used: r.used, max: r.max_allowed, remaining: Math.max(0, r.max_allowed - r.used) })),
    };
  } catch (e: any) {
    console.error("[usage] summary crashed:", e?.message || e);
    return { ok: false, status: 503, error: "Could not load your usage. Please try again." };
  }
}

/** The logged-in user's own plan (read through row-level security: only their own row is visible). */
export async function getMySubscription(): Promise<
  { ok: true; info: SubInfo & { memberSince: string | null } } | { ok: false; status: 401 | 503; error: string }
> {
  try {
    const supabase = await createClient();
    const res = await withTimeout(supabase.auth.getUser(), 6000);
    if (!res) return { ok: false, status: 503, error: "Login service is not responding. Please try again." };
    const user = res.data.user;
    if (!user) {
      if (res.error && (res.error.status === 0 || /fetch/i.test(res.error.message))) {
        return { ok: false, status: 503, error: "Login service is not reachable right now." };
      }
      return { ok: false, status: 401, error: "Please log in." };
    }
    const { data, error } = await supabase
      .from("user_subscriptions")
      .select("plan, status, started_at, current_period_end, billing_period")
      .eq("user_id", user.id)
      .maybeSingle();
    if (error) {
      // Table or columns missing: behave as "free" instead of breaking every page that shows a banner.
      console.error("[usage] subscription read failed:", error.code, error.message);
    }
    return { ok: true, info: { ...describeSubscription(error ? null : data), memberSince: user.created_at ?? null } };
  } catch (e: any) {
    console.error("[usage] subscription crashed:", e?.message || e);
    return { ok: false, status: 503, error: "Could not load your plan." };
  }
}
