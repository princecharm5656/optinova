import { NextResponse } from "next/server";
import { requireAdmin, adminDb, listAllUsers, fetchAll } from "@/lib/admin";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Each tool's history table (one tool per table).
const TOOL_TABLES: Record<string, string> = {
  caption: "captions_history",
  hashtag: "hashtags_history",
  bio: "bios_history",
  email: "emails_history",
  story: "stories_history",
};

export async function GET() {
  const check = await requireAdmin();
  if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });

  try {
    const db = adminDb();
    const warnings: string[] = [];

    const users = await listAllUsers(db);

    // If the subscriptions table is missing, show everyone as free instead of failing.
    let subsAll: any[] = [];
    try {
      subsAll = await fetchAll(db, "user_subscriptions", "user_id, plan, status");
    } catch (e: any) {
      console.error("[admin/stats]", e?.message || e);
      warnings.push("Could not read user_subscriptions (run supabase/subscriptions.sql).");
    }
    const subs = subsAll.filter((s) => s.status === "active");

    // One table failing (e.g. missing) must not blank the whole dashboard.
    const usage: { tool: string; user_id: string }[] = [];
    const toolUsage: Record<string, number> = {};
    await Promise.all(
      Object.entries(TOOL_TABLES).map(async ([tool, table]) => {
        try {
          const rows = await fetchAll(db, table, "user_id");
          toolUsage[tool] = rows.length;
          rows.forEach((r) => usage.push({ tool, user_id: r.user_id }));
        } catch (e: any) {
          console.error("[admin/stats]", e?.message || e);
          toolUsage[tool] = 0;
          warnings.push(`Could not read ${table}.`);
        }
      })
    );

    const usageByUser = new Map<string, number>();
    usage.forEach((u) => usageByUser.set(u.user_id, (usageByUser.get(u.user_id) || 0) + 1));

    const recentUsers = users
      .map((u) => {
        const sub = subs.find((s) => s.user_id === u.id);
        return {
          id: u.id as string,
          email: (u.email as string) || "N/A",
          created_at: u.created_at as string,
          last_sign_in: (u.last_sign_in_at as string) || null,
          email_confirmed: !!u.email_confirmed_at,
          status: sub ? "pro" : "free",
          plan: sub?.plan || "free",
          tool_usage_count: usageByUser.get(u.id) || 0,
          country: u.user_metadata?.country || "Unknown",
        };
      })
      .sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));

    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const activeUsers = users.filter((u) => u.last_sign_in_at && +new Date(u.last_sign_in_at) > sevenDaysAgo).length;

    return NextResponse.json({
      totalUsers: users.length,
      activeUsers,
      proUsers: subs.length,
      totalUsage: usage.length,
      recentUsers,
      toolUsage,
      revenue: { total: subs.length * 9, count: subs.length },
      warnings,
    });
  } catch (e: any) {
    console.error("[admin/stats] failed:", e?.message || e);
    const missingKey = /SERVICE_ROLE_KEY/.test(e?.message || "");
    return NextResponse.json(
      { error: missingKey ? "SUPABASE_SERVICE_ROLE_KEY is not set on the server." : "Could not load analytics." },
      { status: 500 }
    );
  }
}
