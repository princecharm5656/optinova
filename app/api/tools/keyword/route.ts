import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { topic, type = "all" } = body;

    if (!topic) {
      return NextResponse.json({ error: "Topic required" }, { status: 400 });
    }

    let promptType = "";
    switch (type) {
      case "short":
        promptType = "Focus on short-tail keywords (1-2 words).";
        break;
      case "long":
        promptType = "Focus on long-tail keywords (3-5 words).";
        break;
      case "questions":
        promptType = "Focus on question-based keywords (how, what, why, etc.).";
        break;
      default:
        promptType = "Mix of short-tail, long-tail, and question-based keywords.";
    }

    const prompt = `Generate 25 SEO keyword suggestions for the topic: "${topic}".
${promptType}

For each keyword include:
- The keyword
- Search intent (informational/commercial/transactional/navigational)
- Estimated difficulty (easy/medium/hard)
- Estimated search volume (low/medium/high)

Return ONLY as valid JSON array:
[{"keyword": "...", "intent": "...", "difficulty": "...", "volume": "..."}]`;

    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b",
      messages: [
        { 
          role: "system", 
          content: "You are an SEO expert. Return valid JSON arrays only." 
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const responseText = completion.choices[0].message.content || "[]";
    let keywords: any[] = [];

    try {
      const cleaned = responseText.replace(/```json\n?|\n?```/g, "").trim();
      keywords = JSON.parse(cleaned);
      if (!Array.isArray(keywords)) keywords = [];
    } catch {
      keywords = responseText
        .split("\n")
        .map((line) => line.replace(/^[\d\.\-\)\s]+/, "").trim())
        .filter((line) => line.length > 3 && line.length < 100)
        .slice(0, 25)
        .map((keyword) => ({
          keyword,
          intent: "informational",
          difficulty: "medium",
          volume: "medium",
        }));
    }

    return NextResponse.json({ keywords });
  } catch (error: any) {
    console.error("Keyword error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
