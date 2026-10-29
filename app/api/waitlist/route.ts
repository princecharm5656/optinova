import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, source = "homepage" } = body;

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("waitlist")
      .insert({ email, source })
      .select()
      .single();

    if (error && error.code === "23505") {
      return NextResponse.json({ 
        message: "You're already on the list!" 
      });
    }

    if (error) throw error;

    return NextResponse.json({ 
      message: "🎉 Welcome! You're on the list.",
      success: true 
    });
  } catch (error: any) {
    console.error("Waitlist error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
