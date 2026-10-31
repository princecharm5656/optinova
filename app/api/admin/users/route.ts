import { NextResponse } from "next/server";
import { requireAdmin, adminDb, listAllUsers, fetchAll } from "@/lib/admin";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET() {
  const check = await requireAdmin();
  if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });

  try {
    const db = adminDb();
    const [users, subs] = await Promise.all([
      listAllUsers(db),
      fetchAll(db, "user_subscriptions", "user_id, status"),
    ]);
    const list = users
      .map((u) => ({
        id: u.id as string,
        email: (u.email as string) || "",
        created_at: u.created_at as string,
        status: (subs.find((s) => s.user_id === u.id)?.status as string) || "free",
      }))
      .sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
    return NextResponse.json({ users: list });
  } catch (e: any) {
    console.error("[admin/users] failed:", e?.message || e);
    const missingKey = /SERVICE_ROLE_KEY/.test(e?.message || "");
    return NextResponse.json(
      { error: missingKey ? "SUPABASE_SERVICE_ROLE_KEY is not set on the server." : "Could not load users." },
      { status: 500 }
    );
  }
}
