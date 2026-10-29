import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { type, context, tone, subject, body: emailBody } = body;

    if (!context || !emailBody) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("emails_history")
      .insert({
        user_id: user.id,
        type,
        context,
        tone,
        subject,
        body: emailBody,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("Save email error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
