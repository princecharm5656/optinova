import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const body = await request.json();
    const { text, length, format, summary } = body;
    if (!text || !summary) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const { data, error } = await supabase
      .from("captions_history")
      .insert({
        user_id: user.id,
        platform: `Summary (${length}, ${format})`,
        topic: text.substring(0, 200),
        tone: "Summary",
        language: "English",
        captions: [summary],
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
