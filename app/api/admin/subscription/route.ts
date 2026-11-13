import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, adminDb } from "@/lib/admin";
import { nextPeriod, type BillingPeriod } from "@/lib/subscription";

export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
// "teams" is NOT sold yet (the features are not built), so the server refuses to grant it by mistake.
const GRANTABLE_PLANS = ["pro"];
const PERIODS: BillingPeriod[] = ["monthly", "yearly"];

/**
 * POST { userId, action: "grant", plan: "pro", period: "monthly" | "yearly" }
 *   New customer or expired plan -> starts now.  Running plan -> the period is ADDED to the current end date.
 * POST { userId, action: "cancel" }  -> ends the plan immediately.
 */
export async function POST(req: NextRequest) {
  // Only our own pages may call this (blocks cross-site requests riding on the admin's cookie).
  const site = req.headers.get("sec-fetch-site");
  if (site && site !== "same-origin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const check = await requireAdmin();
  if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });

  const body = await req.json().catch(() => ({}));
  const userId = String(body?.userId ?? "");
  const action = body?.action;
  const plan = body?.plan;
  const period = body?.period as BillingPeriod;
  if (!UUID.test(userId)) return NextResponse.json({ error: "Invalid user." }, { status: 400 });
  if (action !== "grant" && action !== "cancel") return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  if (action === "grant") {
    if (!GRANTABLE_PLANS.includes(plan)) return NextResponse.json({ error: "Invalid plan." }, { status: 400 });
    if (!PERIODS.includes(period)) return NextResponse.json({ error: "Choose monthly or yearly." }, { status: 400 });
  }

  try {
    const db = adminDb();
    const now = new Date();
    const nowIso = now.toISOString();

    if (action === "cancel") {
      const { error } = await db.from("user_subscriptions").update({ status: "canceled", updated_at: nowIso }).eq("user_id", userId);
      if (error) throw new Error(error.message);
      return NextResponse.json({ ok: true });
    }

    const { data: existing, error: readErr } = await db
      .from("user_subscriptions")
      .select("plan, status, started_at, current_period_end, billing_period")
      .eq("user_id", userId)
      .maybeSingle();
    if (readErr) throw new Error(readErr.message);

    const { startedAt, endsAt } = nextPeriod(existing, period, now);
    const values = {
      plan,
      status: "active",
      started_at: startedAt.toISOString(),
      current_period_end: endsAt.toISOString(),
      billing_period: period,
      updated_at: nowIso,
    };

    if (existing) {
      const { error } = await db.from("user_subscriptions").update(values).eq("user_id", userId);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await db.from("user_subscriptions").insert({ user_id: userId, ...values });
      if (error) throw new Error(error.message);
    }
    return NextResponse.json({ ok: true, endsAt: values.current_period_end });
  } catch (e: any) {
    console.error("[admin/subscription] failed:", e?.message || e);
    const missingKey = /SERVICE_ROLE_KEY/.test(e?.message || "");
    const needsSql = /current_period_end|started_at|billing_period|schema cache/i.test(e?.message || "");
    return NextResponse.json(
      {
        error: missingKey
          ? "SUPABASE_SERVICE_ROLE_KEY is not set on the server."
          : needsSql
          ? "Plan dates are not set up yet. Run supabase/limits.sql in the Supabase SQL Editor."
          : "Could not update the subscription.",
      },
      { status: 500 }
    );
  }
}
