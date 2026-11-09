import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = String(body?.email ?? "").trim().toLowerCase();
    const source = String(body?.source ?? "homepage").trim().slice(0, 40) || "homepage";

    if (email.length > 254 || !EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    const supabase = await createClient();
    // No .select() on purpose: visitors may insert, but cannot read the list back.
    const { error } = await supabase.from("waitlist").insert({ email, source });

    if (error && error.code === "23505") {
      return NextResponse.json({ message: "You're already on the list!" });
    }
    if (error) throw error;

    return NextResponse.json({ message: "Welcome! You're on the list.", success: true });
  } catch (error: any) {
    console.error("Waitlist error:", error?.code, error?.message || error);
    return NextResponse.json({ error: "Could not join the list right now. Please try again later." }, { status: 500 });
  }
}
