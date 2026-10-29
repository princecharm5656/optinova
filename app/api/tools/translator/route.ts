import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, fromLang = "English", toLang } = body;

    if (!text || !toLang) {
      return NextResponse.json({ error: "Text and target language required" }, { status: 400 });
    }

    // Handle script instructions for specific languages
    let scriptInstruction = "";
    if (toLang === "Roman Urdu" || toLang === "Hindi (Roman)") {
      scriptInstruction = "Use Roman/English script (e.g., 'Aap kaise hain' not 'آپ کیسے ہیں').";
    } else if (toLang === "Urdu" || toLang === "Hindi") {
      scriptInstruction = "Use the native script (e.g., Devanagari for Hindi, Nastaliq for Urdu).";
    } else if (toLang === "Chinese" || toLang === "Japanese" || toLang === "Korean") {
      scriptInstruction = `Use the proper native characters and grammar for ${toLang}.`;
    }

    const prompt = `You are an expert translator. Translate the following text from ${fromLang} to ${toLang}.

${scriptInstruction}

Text to translate:
"""
${text}
"""

Requirements:
- Natural, fluent translation (not word-for-word)
- Preserve tone, meaning, and style
- Use proper grammar in target language
- Don't add commentary or explanation

Return ONLY the translated text. No quotes, no preamble.`;

    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b",
      messages: [
        { 
          role: "system", 
          content: `You are a professional translator fluent in ${fromLang} and ${toLang}. Return only the translated text.` 
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.2,
      max_tokens: 2000,
    });

    const translation = completion.choices[0].message.content?.trim() || "";

    return NextResponse.json({ translation });
  } catch (error: any) {
    console.error("Translation error:", error);
    return NextResponse.json({ error: error.message || "Failed" }, { status: 500 });
  }
}
