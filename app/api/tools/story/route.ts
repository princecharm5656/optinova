import { NextRequest, NextResponse } from "next/server";
import { toolChat } from "@/lib/groq";
import { guardTool } from "@/lib/usage";

export async function POST(request: NextRequest) {
  const blocked = await guardTool(); // login + daily limit
  if (blocked) return blocked;

  try {
    const body = await request.json();
    const { topic, style, length = "short" } = body;

    if (!topic) {
      return NextResponse.json({ error: "Topic required" }, { status: 400 });
    }

    const wordCount = length === "short" ? "150-300" : "400-600";

    const prompt = `Write a creative ${style} story about "${topic}".
Length: ${wordCount} words.

Write engaging content. Return ONLY as JSON:
{"title": "story title", "content": "full story text"}`;

    const completion = await toolChat({
      messages: [
        { role: "system", content: "You are a creative writer. Return valid JSON with title and content." },
        { role: "user", content: prompt },
      ],
      temperature: 0.9,
      max_tokens: 1200,
    });

    const responseText = completion.choices[0].message.content || "{}";
    let result = { title: "", content: "" };

    try {
      const cleaned = responseText.replace(/```json\n?|\n?```/g, "").trim();
      result = JSON.parse(cleaned);
    } catch {
      const titleMatch = responseText.match(/title["']?\s*:\s*["']?([^"'\n]+)/i);
      const contentMatch = responseText.match(/content["']?\s*:\s*["']?([\s\S]+)/i);
      if (titleMatch) result.title = titleMatch[1].trim();
      if (contentMatch) result.content = contentMatch[1].trim().replace(/["'}]/g, "");
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Story error:", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
