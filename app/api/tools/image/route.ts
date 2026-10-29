import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, style = "realistic", width = 1024, height = 1024 } = body;

    if (!prompt) {
      return NextResponse.json({ error: "Prompt required" }, { status: 400 });
    }

    // Pollinations.ai - FREE image generation, no API key needed
    const enhancedPrompt = encodeURIComponent(prompt);
    const imageUrl = `https://image.pollinations.ai/prompt/${enhancedPrompt}?width=${width}&height=${height}&seed=42&nologo=true`;

    return NextResponse.json({
      imageUrl,
      prompt,
      style,
      width,
      height,
    });
  } catch (error: any) {
    console.error("Image generation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate image" },
      { status: 500 }
    );
  }
}
