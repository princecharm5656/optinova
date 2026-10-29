import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { platform, about, tone = "Professional", name } = body;

    if (!about) {
      return NextResponse.json({ error: "About info required" }, { status: 400 });
    }

    const prompt = `Generate 5 creative bio options for ${platform}.
${name ? `Name: ${name}` : ""}
About: ${about}
Tone: ${tone}

Requirements:
- Each bio 150-300 characters
- Include emojis where appropriate
- Platform-appropriate style
- Make it engaging and memorable
- No quotation marks around bios

Return ONLY as JSON array:
["bio 1", "bio 2", ...]`;

    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b",
      messages: [
        { role: "system", content: "You are a personal branding expert. Return valid JSON arrays only." },
        { role: "user", content: prompt },
      ],
      temperature: 0.85,
      max_tokens: 800,
    });

    const responseText = completion.choices[0].message.content || "[]";
    let bios: string[] = [];

    try {
      bios = JSON.parse(responseText);
      if (!Array.isArray(bios)) bios = [];
    } catch {
      bios = responseText
        .split("\n")
        .map((line) => line.replace(/^\d+[\.\)]\s*/, "").replace(/^["']|["']$/g, "").trim())
        .filter((line) => line.length > 30 && line.length < 400)
        .slice(0, 5);
    }

    return NextResponse.json({ bios });
  } catch (error: any) {
    console.error("Bio error:", error);
    return NextResponse.json({ error: error.message || "Failed" }, { status: 500 });
  }
}
