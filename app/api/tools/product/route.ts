import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { product, features, audience, tone = "Persuasive", count = 3 } = body;

    if (!product) {
      return NextResponse.json({ error: "Product name required" }, { status: 400 });
    }

    const prompt = `Generate ${count} product descriptions for: "${product}".
Features: ${features || "general benefits"}
Target audience: ${audience || "general consumers"}
Tone: ${tone}

Requirements:
- Each description 2-4 sentences
- Highlight key benefits
- Include emotional appeal
- End with call-to-action
- Make them conversion-focused

Return ONLY as JSON array:
["description 1", "description 2", "description 3"]`;

    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b",
      messages: [
        { role: "system", content: "You are an expert e-commerce copywriter. Return only valid JSON arrays." },
        { role: "user", content: prompt },
      ],
      temperature: 0.8,
      max_tokens: 1000,
    });

    const responseText = completion.choices[0].message.content || "[]";
    let descriptions: string[] = [];

    try {
      descriptions = JSON.parse(responseText);
      if (!Array.isArray(descriptions)) descriptions = [];
    } catch {
      descriptions = responseText
        .split("\n")
        .map((line) => line.replace(/^\d+[\.\)]\s*/, "").replace(/^["']|["']$/g, "").trim())
        .filter((line) => line.length > 20 && line.length < 500)
        .slice(0, count);
    }

    return NextResponse.json({ descriptions });
  } catch (error: any) {
    console.error("Product description error:", error);
    return NextResponse.json({ error: error.message || "Failed" }, { status: 500 });
  }
}
