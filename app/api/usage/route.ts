import { NextResponse } from "next/server";
import { getUsageSummary } from "@/lib/usage";

export const dynamic = "force-dynamic";

// The logged-in user's own daily usage (used by the dashboard, account page and the account menu).
export async function GET() {
  const summary = await getUsageSummary();
  if (!summary.ok) return NextResponse.json({ error: summary.error }, { status: summary.status });
  return NextResponse.json(
    { paid: summary.paid, items: summary.items },
    { headers: { "Cache-Control": "no-store" } }
  );
}
