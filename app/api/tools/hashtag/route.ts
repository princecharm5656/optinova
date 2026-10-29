import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { platform, topic, niche, count = 20 } = body;

    if (!topic) {
      return NextResponse.json({ error: "Topic required" }, { status: 400 });
    }

    const prompt = `Generate ${count} trending ${platform} hashtags for a post about "${topic}".
Niche: ${niche || "general"}

Requirements:
- Mix of popular and niche hashtags
- Platform-appropriate (Instagram = longer tags, Twitter = shorter)
- Include trending tags relevant to topic
- No # symbol, just text

Return ONLY as JSON array of strings:
["tag1", "tag2", "tag3", ...]`;

    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b",
      messages: [
        {
          role: "system",
          content:
            "You are a social media hashtag expert. Return only valid JSON arrays.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.9,
      max_tokens: 800,
    });

    const responseText = completion.choices[0].message.content || "[]";
    let hashtags: string[] = [];

    try {
      hashtags = JSON.parse(responseText);
      if (!Array.isArray(hashtags)) hashtags = [];
    } catch {
      hashtags = responseText
        .split("\n")
        .map((line) =>
          line
            .replace(/^\d+[\.\)]\s*/, "")
            .replace(/[#"]/g, "")
            .trim()
        )
        .filter((line) => line.length > 2 && line.length < 50)
        .slice(0, count);
    }

    return NextResponse.json({ hashtags });
  } catch (error: any) {
    console.error("Hashtag error:", error);
    return NextResponse.json(
      { error: error.message || "Failed" },
      { status: 500 }
    );
  }
}
