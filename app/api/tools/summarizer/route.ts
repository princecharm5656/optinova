import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, length = "medium", format = "paragraph" } = body;

    if (!text) {
      return NextResponse.json({ error: "Text required" }, { status: 400 });
    }

    const sentences = length === "short" ? "2-3" : length === "medium" ? "4-6" : "8-10";
    const formatInstruction = format === "bullets" ? "Use bullet points." : format === "tldr" ? "Start with 'TL;DR:' then explain." : "Write as a paragraph.";

    const prompt = `Summarize the following text in ${sentences} sentences.
Format: ${formatInstruction}
Focus on key points and main ideas.

Text:
"""
${text}
"""

Return ONLY the summary, no preamble.`;

    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b",
      messages: [
        { role: "system", content: "You are an expert summarizer. Return only the summary." },
        { role: "user", content: prompt },
      ],
      temperature: 0.4,
      max_tokens: 800,
    });

    const summary = completion.choices[0].message.content?.trim() || "";

    return NextResponse.json({ summary });
  } catch (error: any) {
    console.error("Summary error:", error);
    return NextResponse.json({ error: error.message || "Failed" }, { status: 500 });
  }
}
