import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, adminDb } from "@/lib/admin";

export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const PLANS = ["pro", "teams"];

/** POST { userId, action: "upgrade" | "cancel", plan?: "pro" | "teams" } */
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
  if (!UUID.test(userId)) return NextResponse.json({ error: "Invalid user." }, { status: 400 });
  if (action !== "upgrade" && action !== "cancel") return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  if (action === "upgrade" && !PLANS.includes(plan)) return NextResponse.json({ error: "Invalid plan." }, { status: 400 });

  try {
    const db = adminDb();
    const now = new Date().toISOString();

    if (action === "cancel") {
      const { error } = await db.from("user_subscriptions").update({ status: "canceled", updated_at: now }).eq("user_id", userId);
      if (error) throw new Error(error.message);
      return NextResponse.json({ ok: true });
    }

    // Update if a row exists, otherwise insert (works whether or not user_id has a unique constraint).
    const { data: updated, error: updErr } = await db
      .from("user_subscriptions")
      .update({ plan, status: "active", updated_at: now })
      .eq("user_id", userId)
      .select("user_id");
    if (updErr) throw new Error(updErr.message);
    if (!updated || updated.length === 0) {
      const { error: insErr } = await db.from("user_subscriptions").insert({ user_id: userId, plan, status: "active", updated_at: now });
      if (insErr) throw new Error(insErr.message);
    }
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("[admin/subscription] failed:", e?.message || e);
    const missingKey = /SERVICE_ROLE_KEY/.test(e?.message || "");
    return NextResponse.json(
      { error: missingKey ? "SUPABASE_SERVICE_ROLE_KEY is not set on the server." : "Could not update the subscription." },
      { status: 500 }
    );
  }
}
