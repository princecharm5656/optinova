import { NextResponse } from "next/server";
import { getMySubscription } from "@/lib/usage";

export const dynamic = "force-dynamic";

// The logged-in user's own plan: state, start/end date, days left.
export async function GET() {
  const res = await getMySubscription();
  if (!res.ok) return NextResponse.json({ error: res.error }, { status: res.status });
  return NextResponse.json(res.info, { headers: { "Cache-Control": "no-store" } });
}
