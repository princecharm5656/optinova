import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const body = await request.json();
    const { text, fromLang, toLang, translation } = body;
    if (!text || !translation) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const { data, error } = await supabase
      .from("captions_history")
      .insert({
        user_id: user.id,
        platform: `Translate ${fromLang} → ${toLang}`,
        topic: text.substring(0, 200),
        tone: "Translation",
        language: toLang,
        captions: [translation],
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
