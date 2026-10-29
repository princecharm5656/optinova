import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { topic, keywords, tone = "Informative", length = "medium", language = "English" } = body;

    if (!topic) {
      return NextResponse.json({ error: "Topic required" }, { status: 400 });
    }

    const wordTarget = length === "short" ? "400-600" : length === "medium" ? "800-1200" : "1500-2000";

    const prompt = `Write a ${tone.toLowerCase()} blog post about "${topic}".
Target keywords: ${keywords || "none specified"}
Word count: ${wordTarget} words
Language: ${language}

Structure:
- Catchy title
- Introduction (hook + thesis)
- 3-5 main sections with subheadings
- Conclusion with key takeaways
- Call-to-action at the end

Return ONLY as JSON:
{"title": "blog title", "content": "full blog content with markdown formatting"}`;

    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b",
      messages: [
        { role: "system", content: "You are an expert blog writer. Return valid JSON with title and content keys." },
        { role: "user", content: prompt },
      ],
      temperature: 0.75,
      max_tokens: 2500,
    });

    const responseText = completion.choices[0].message.content || "{}";
    let result = { title: "", content: "" };

    try {
      const cleaned = responseText.replace(/```json\n?|\n?```/g, "").trim();
      result = JSON.parse(cleaned);
    } catch {
      const titleMatch = responseText.match(/title["']?\s*:\s*["']?([^"'\n]+)/i);
      const contentMatch = responseText.match(/content["']?\s*:\s*["']?(.+)/is);
      if (titleMatch) result.title = titleMatch[1].trim();
      if (contentMatch) result.content = contentMatch[1].trim().replace(/["'}]/g, "");
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Blog error:", error);
    return NextResponse.json({ error: error.message || "Failed" }, { status: 500 });
  }
}
