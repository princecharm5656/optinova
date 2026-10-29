import { NextRequest, NextResponse } from "next/server";
import { requireLoginAndClaim } from "@/lib/usage";

export const maxDuration = 60;

const STYLE_SUFFIX = ", professional photography, soft natural lighting, high detail, no text, no watermark";

/**
 * GET /api/tools/magic/image?prompt=...&seed=123
 *
 * - With POLLINATIONS_API_KEY set: the server fetches the image (key stays secret) and streams it.
 *   Non-image / error responses become a real HTTP error, so the UI can show Retry.
 * - Without a key: redirects the browser to the free anonymous endpoint (heavily rate-limited).
 */
export async function GET(req: NextRequest) {
  // Only let our own pages use this (stops other sites hot-linking and burning the key).
  const site = req.headers.get("sec-fetch-site");
  if (site && site !== "same-origin" && site !== "none") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const raw = (req.nextUrl.searchParams.get("prompt") || "").trim().slice(0, 500);
  if (raw.length < 5) return NextResponse.json({ error: "prompt required" }, { status: 400 });
  const seed = Math.abs(parseInt(req.nextUrl.searchParams.get("seed") || "", 10)) || 1;

  // Login required + daily image limit (this route spends our Pollinations quota).
  const claim = await requireLoginAndClaim("image");
  if (!claim.ok) return NextResponse.json({ error: claim.error }, { status: claim.status });

  const text = encodeURIComponent(raw + STYLE_SUFFIX);
  const key = process.env.POLLINATIONS_API_KEY;

  if (!key) {
    return NextResponse.redirect(
      `https://image.pollinations.ai/prompt/${text}?seed=${seed}&width=768&height=768&nologo=true`,
      307
    );
  }

  try {
    const upstream = await fetch(
      `https://gen.pollinations.ai/image/${text}?key=${encodeURIComponent(key)}&seed=${seed}&width=768&height=768&nologo=true`,
      { signal: AbortSignal.timeout(55_000) }
    );
    const type = upstream.headers.get("content-type") || "";
    if (!upstream.ok || !type.startsWith("image/")) {
      console.error(`[magic-image] upstream ${upstream.status} ${type}`);
      return NextResponse.json({ error: "Image service unavailable" }, { status: 502 });
    }
    return new Response(upstream.body, {
      headers: { "content-type": type, "cache-control": "public, max-age=86400, immutable" },
    });
  } catch (e: any) {
    console.error("[magic-image] failed:", e?.message || e);
    return NextResponse.json({ error: "Image service unavailable" }, { status: 502 });
  }
}
