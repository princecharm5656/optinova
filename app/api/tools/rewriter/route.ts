import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, style = "improve", strength = "medium" } = body;

    if (!text) {
      return NextResponse.json({ error: "Text required" }, { status: 400 });
    }

    const styleInstructions = {
      improve: "Improve clarity, flow, grammar, and impact while keeping the original meaning and structure. Make it polished and professional.",
      simplify: "Simplify the language to make it clear and easy to understand. Use shorter sentences and common words.",
      formal: "Rewrite in a highly formal, professional tone. Use sophisticated vocabulary and proper grammar.",
      casual: "Rewrite in a casual, conversational tone. Use contractions, friendly language, and a relaxed style.",
      shorten: "Make it 50% shorter while preserving the key information and meaning.",
      expand: "Expand with more detail, examples, and explanation. Make it more thorough.",
    };

    const strengthInstruction = 
      strength === "light" ? "Make only minor improvements - fix grammar, punctuation, and word choice." : 
      strength === "heavy" ? "Completely rewrite with fresh wording and new sentence structures while keeping the meaning." : 
      "Strike a balance - improve quality while preserving some of the original phrasing.";

    const prompt = `${styleInstructions[style as keyof typeof styleInstructions]}

Approach: ${strengthInstruction}

Requirements:
- Perfect grammar and punctuation
- Engaging sentence structure
- Natural, flowing prose
- Maintain original meaning
- Output only the rewritten text, no preamble

Original text:
"""
${text}
"""`;

    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b",
      messages: [
        { 
          role: "system", 
          content: "You are a professional editor and rewrite expert. Your rewrites are polished, engaging, and publication-quality. Return only the rewritten text." 
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.6,
      max_tokens: 2000,
    });

    const rewrite = completion.choices[0].message.content?.trim() || "";

    return NextResponse.json({ rewrite });
  } catch (error: any) {
    console.error("Rewrite error:", error);
    return NextResponse.json({ error: error.message || "Failed" }, { status: 500 });
  }
}
