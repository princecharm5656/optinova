import { NextRequest, NextResponse } from "next/server";
import { requireLogin } from "@/lib/usage";

/**
 * Builds a URL to OUR image proxy (/api/tools/magic/image). The proxy is what checks the daily
 * image limit, uses the secret Pollinations key (no watermark) and returns real HTTP errors.
 * Here we only require login, so one image is counted once (by the proxy), not twice.
 */
export async function POST(request: NextRequest) {
  const login = await requireLogin();
  if (!login.ok) return NextResponse.json({ error: login.error }, { status: login.status });

  try {
    const body = await request.json().catch(() => ({}));
    const prompt = String(body?.prompt ?? "").trim().slice(0, 450);
    const style = String(body?.style ?? "").trim().slice(0, 40);
    const clamp = (v: unknown) => Math.min(1280, Math.max(256, Math.round(Number(v) || 1024)));
    const width = clamp(body?.width);
    const height = clamp(body?.height);

    if (prompt.length < 5) {
      return NextResponse.json({ error: "Please describe the image in a few words." }, { status: 400 });
    }

    // The chosen style is now part of the prompt (before, it was ignored). New seed every time = new variation.
    const fullPrompt = style ? `${prompt}, ${style} style` : prompt;
    const seed = Math.floor(Math.random() * 1_000_000_000);
    const imageUrl =
      `/api/tools/magic/image?prompt=${encodeURIComponent(fullPrompt)}` +
      `&seed=${seed}&w=${width}&h=${height}&raw=1`;

    return NextResponse.json({ imageUrl, prompt, style, width, height });
  } catch (error: any) {
    console.error("Image generation error:", error?.message || error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
