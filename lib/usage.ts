import { createClient } from "@/lib/supabase/server";

export type UsageKind = "magic" | "image";

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
        error: `Daily limit reached (${row?.max_allowed ?? "?"} per 24 hours). Please try again later.`,
      };
    }
    return { ok: true, remaining: row.remaining, limit: row.max_allowed };
  } catch (e: any) {
    console.error("[usage] unexpected:", e?.message || e);
    return { ok: false, status: 503, error: "Something went wrong checking your account. Please try again." };
  }
}
