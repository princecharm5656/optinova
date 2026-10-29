import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, subject, context, tone = "Professional" } = body;

    if (!type || !context) {
      return NextResponse.json({ error: "Type and context required" }, { status: 400 });
    }

    const prompt = `Write a ${type} email.
${subject ? `Subject context: ${subject}` : ""}
Context: ${context}
Tone: ${tone}

Return ONLY as JSON:
{"subject": "email subject", "body": "full email body"}

Do not include quotes around the JSON values.`;

    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b",
      messages: [
        { role: "system", content: "You are an email writing expert. Return valid JSON only with subject and body keys." },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 800,
    });

    const responseText = completion.choices[0].message.content || "{}";
    let result = { subject: "", body: "" };

    try {
      const cleaned = responseText.replace(/```json\n?|\n?```/g, "").trim();
      result = JSON.parse(cleaned);
    } catch {
      // Try to extract from text
      const subjectMatch = responseText.match(/subject["']?\s*:\s*["']?([^"'\n]+)/i);
      const bodyMatch = responseText.match(/body["']?\s*:\s*["']?(.+)/is);
      if (subjectMatch) result.subject = subjectMatch[1].trim();
      if (bodyMatch) result.body = bodyMatch[1].trim().replace(/["'}]/g, "");
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Email error:", error);
    return NextResponse.json({ error: error.message || "Failed" }, { status: 500 });
  }
}
