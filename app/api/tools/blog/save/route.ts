import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const body = await request.json();
    const { topic, keywords, tone, length, language, title, content } = body;
    if (!topic || !content) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    // Use bios_history or create new — for simplicity using existing tables
    const { data, error } = await supabase
      .from("bios_history")
      .insert({
        user_id: user.id,
        platform: "Blog",
        name: title,
        about: topic,
        tone,
        bios: [{ title, content, keywords, length, language }],
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("Save blog error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
