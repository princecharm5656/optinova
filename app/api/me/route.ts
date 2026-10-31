import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/admin";

export const dynamic = "force-dynamic";

// Used by the account tag shown on each page. Reveals only the caller's OWN email.
export async function GET() {
  const me = await getCurrentUser();
  return NextResponse.json(me, { headers: { "Cache-Control": "no-store" } });
}
