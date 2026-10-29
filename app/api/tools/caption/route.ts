import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

// ✅ FIXED: Initialize the groq client properly
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { platform, topic, tone, language } = body;

    if (!topic || !platform) {
      return NextResponse.json(
        { error: "Platform and topic required" },
        { status: 400 }
      );
    }

    const prompt = `Generate 5 engaging ${platform} captions about "${topic}".

Tone: ${tone || "engaging"}
Language: ${language || "English"}

Requirements:
- Each caption 1-3 sentences
- Include relevant emojis
- Platform-appropriate length
- ${language?.includes("Urdu") ? "Use Roman Urdu (English script)" : "Use English"}

Return ONLY as valid JSON array:
["caption 1", "caption 2", "caption 3", "caption 4", "caption 5"]`;

    const completion = await groq.chat.completions.create({
      // ✅ Using a stable model name
      model: "openai/gpt-oss-120b", 

      messages: [
        {
          role: "system",
          content:
            "You are an expert social media caption writer. Always return responses as valid JSON arrays only.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.8,
      max_tokens: 1024,
    });

    const responseText = completion.choices[0].message.content || "[]";

    let captions: string[] = [];
    try {
      captions = JSON.parse(responseText);
      if (!Array.isArray(captions)) {
        captions = [responseText];
      }
    } catch {
      captions = responseText
        .split("\n")
        .map((line) =>
          line
            .replace(/^\d+[\.\)]\s*/, "")
            .replace(/^["']|["']$/g, "")
            .trim()
        )
        .filter((line) => line.length > 10 && line.length < 500)
        .slice(0, 5);
    }

    return NextResponse.json({ captions });
  } catch (error: any) {
    console.error("Caption generation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate captions" },
      { status: 500 }
    );
  }
}