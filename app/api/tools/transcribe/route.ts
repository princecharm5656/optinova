import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get("audio") as File;
    const language = (formData.get("language") as string) || "en";

    if (!audioFile) {
      return NextResponse.json({ error: "Audio file required" }, { status: 400 });
    }

    // Forward to free transcription API
    // Using webwhisper.com free API endpoint
    const externalFormData = new FormData();
    externalFormData.append("audio_file", audioFile);
    externalFormData.append("language", language);

    const response = await fetch("https://api.webwhisper.com/transcribe", {
      method: "POST",
      body: externalFormData,
    });

    if (!response.ok) {
      throw new Error("Transcription service unavailable");
    }

    const data = await response.json();
    
    return NextResponse.json({
      text: data.text || data.transcript || "",
      language,
      duration: data.duration || 0,
    });
  } catch (error: any) {
    console.error("Transcription error:", error);
    
    // Fallback: Use Groq Whisper API (if you add GROQ_WHISPER_KEY)
    // For now, return friendly error
    return NextResponse.json(
      { error: "Transcription service temporarily unavailable. Try again or use another tool." },
      { status: 503 }
    );
  }
}
