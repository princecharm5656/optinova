import { NextResponse } from "next/server";
import { groqJSON } from "@/lib/groq";
import { requireLoginAndClaim } from "@/lib/usage";
import { saveBlueprint } from "@/lib/blueprints";
import type { Blueprint, Finance, SetupItem, FixedCost } from "@/lib/magic/types";

// Default currency when the prompt gives no location hint. Change if your audience changes.
export const maxDuration = 60;

const DEFAULT_CURRENCY = "PKR";
const MAX_PROMPT_LENGTH = 400;

const SYSTEM_PROMPT = `You are a senior business consultant who writes realistic, conservative startup blueprints.
Return ONLY one valid JSON object. No markdown, no commentary.

RULES
- Match the positioning to the user's request. Use luxury/premium language ONLY if the user asked for or implied it.
- Currency: infer from the city/country in the request (Karachi/Lahore/Pakistan -> PKR). If unclear use ${DEFAULT_CURRENCY}.
- ALL money values are plain JSON numbers in whole currency units (e.g. 4500000). Never strings, never "M" or "K" suffixes.
- Use realistic LOCAL market prices. Prefer conservative estimates over impressive ones.
- Every number must be explainable by the assumptions you list.
- NUMBERS MUST BE CONSISTENT: maxMonthlyRevenue x (1 - cogsPercent/100) must be at least 25% HIGHER than the sum of all monthly fixedCosts, otherwise the business loses money forever. Check this before answering, and raise revenue (or cut costs) until it holds.

JSON SHAPE
{
  "meta": { "businessName": "short brandable name", "tagline": "max 8 words", "summary": "1-2 sentences", "location": "city/country", "currency": "ISO code" },
  "assumptions": ["4 to 6 short facts the numbers are based on, e.g. '1 flagship outlet of 1,500 sq ft', '18 staff', 'avg ticket PKR 1,800'"],
  "setupItems": [ { "category": "Interior fit-out", "low": 0, "high": 0, "note": "why, max 12 words" } ],
  "fixedCosts": [ { "category": "Rent", "amount": 0 } ],
  "revenueModel": { "month1Revenue": 0, "monthlyGrowthPercent": 0, "maxMonthlyRevenue": 0, "cogsPercent": 0 },
  "sections": [
    { "title": "Vision",     "points": [ { "label": "short label", "text": "max 35 words" } ] },
    { "title": "Strategy",   "points": [ ... ] },
    { "title": "Marketing",  "points": [ ... ] },
    { "title": "Operations", "points": [ ... ] }
  ],
  "nextMoves": [ { "day": 1, "title": "short action", "detail": "max 25 words" } ],
  "imagePrompts": { "brand": "...", "space": "...", "product": "..." }
}

COUNTS
- setupItems: 6 to 9 items (interior/equipment/licences/deposit/branding/launch marketing/working capital...). low <= high.
- fixedCosts: 5 to 8 MONTHLY items (rent, salaries, utilities, marketing, software, misc).
- revenueModel: month1Revenue = realistic first-month revenue; monthlyGrowthPercent between 2 and 20; maxMonthlyRevenue = realistic ceiling for this one business; cogsPercent = cost of goods as % of revenue (5-80).
- sections: exactly the 4 titles above, each 3 or 4 points.
- nextMoves: exactly 7 items, day 1 to 7.
- imagePrompts: 3 vivid, SPECIFIC photographic prompts for THIS business (brand = brand identity/packaging flat-lay, space = where customers experience it, product = hero product shot). Never ask for readable text, words or letters inside the image.`;

const num = (v: unknown, fallback = NaN) => {
  const n = typeof v === "number" ? v : parseFloat(String(v ?? "").replace(/[^0-9.\-]/g, ""));
  return Number.isFinite(n) ? n : fallback;
};
const str = (v: unknown, max = 400) => String(v ?? "").trim().slice(0, max);

function buildFinance(raw: any, currency: string): Finance {
  const setupItems: SetupItem[] = (Array.isArray(raw.setupItems) ? raw.setupItems : [])
    .map((i: any) => {
      const a = num(i?.low), b = num(i?.high);
      return { category: str(i?.category, 60), low: Math.min(a, b), high: Math.max(a, b), note: str(i?.note, 120) };
    })
    .filter((i: SetupItem) => i.category && i.low > 0 && i.high > 0);

  const fixedCosts: FixedCost[] = (Array.isArray(raw.fixedCosts) ? raw.fixedCosts : [])
    .map((i: any) => ({ category: str(i?.category, 60), amount: num(i?.amount) }))
    .filter((i: FixedCost) => i.category && i.amount > 0);

  const rm = raw.revenueModel || {};
  const month1 = num(rm.month1Revenue);
  const growth = Math.min(Math.max(num(rm.monthlyGrowthPercent, 8), 0), 30);
  const cogs = Math.min(Math.max(num(rm.cogsPercent, 40), 0), 90);
  const cap = num(rm.maxMonthlyRevenue);

  if (setupItems.length < 3 || fixedCosts.length < 3 || !(month1 > 0) || !(cap >= month1)) {
    throw new Error("incomplete financial data from AI");
  }

  // ---- All maths happens HERE, not in the AI ----
  const fixedForCheck = fixedCosts.reduce((s, i) => s + i.amount, 0);
  if (cap * (1 - cogs / 100) <= fixedForCheck * 1.05) {
    throw new Error("AI numbers are inconsistent: business can never be profitable");
  }
  const setupLow = setupItems.reduce((s, i) => s + i.low, 0);
  const setupHigh = setupItems.reduce((s, i) => s + i.high, 0);
  const setupMid = (setupLow + setupHigh) / 2;
  const fixedTotal = fixedCosts.reduce((s, i) => s + i.amount, 0);

  let cumulative = -setupMid;
  let breakEvenMonth: number | null = null;
  const full = Array.from({ length: 60 }, (_, idx) => {
    const month = idx + 1;
    const revenue = Math.min(month1 * Math.pow(1 + growth / 100, idx), cap);
    const profit = revenue * (1 - cogs / 100) - fixedTotal;
    cumulative += profit;
    if (breakEvenMonth === null && cumulative >= 0) breakEvenMonth = month;
    return { month, revenue: Math.round(revenue), profit: Math.round(profit), cumulative: Math.round(cumulative) };
  });
  const projection = full.slice(0, 24); // chart shows 24 months; break-even searched over 60

  return {
    currency, setupItems, setupLow: Math.round(setupLow), setupHigh: Math.round(setupHigh),
    fixedCosts, fixedTotal: Math.round(fixedTotal), cogsPercent: cogs,
    projection, breakEvenMonth, month12Revenue: projection[11].revenue,
  };
}

function validate(raw: any): Blueprint {
  const currency = str(raw?.meta?.currency, 5).toUpperCase() || DEFAULT_CURRENCY;

  // Keep exactly the 4 known sections, once each, in a fixed order (AI sometimes repeats or invents titles).
  const SECTION_ORDER = ["Vision", "Strategy", "Marketing", "Operations"];
  const found = new Map<string, { title: string; points: { label: string; text: string }[] }>();
  for (const s of Array.isArray(raw.sections) ? raw.sections : []) {
    const title = SECTION_ORDER.find((t) => t.toLowerCase() === str(s?.title, 40).toLowerCase());
    if (!title || found.has(title)) continue; // unknown or duplicate -> ignore
    const points = (Array.isArray(s?.points) ? s.points : [])
      .map((p: any) => ({ label: str(p?.label, 60), text: str(p?.text, 300) }))
      .filter((p: any) => p.label && p.text)
      .slice(0, 4);
    if (points.length >= 2) found.set(title, { title, points });
  }
  const sections = SECTION_ORDER.filter((t) => found.has(t)).map((t) => found.get(t)!);

  const nextMoves = (Array.isArray(raw.nextMoves) ? raw.nextMoves : [])
    .map((m: any, i: number) => ({ day: num(m?.day, i + 1), title: str(m?.title, 80), detail: str(m?.detail, 200) }))
    .filter((m: any) => m.title);

  const ip = raw.imagePrompts || {};
  if (sections.length < 3 || nextMoves.length < 5 || !ip.brand || !ip.space || !ip.product) {
    throw new Error("incomplete blueprint from AI");
  }

  return {
    meta: {
      businessName: str(raw.meta?.businessName, 60) || "Your Business",
      tagline: str(raw.meta?.tagline, 80),
      summary: str(raw.meta?.summary, 300),
      location: str(raw.meta?.location, 60),
      currency,
    },
    assumptions: (Array.isArray(raw.assumptions) ? raw.assumptions : []).map((a: any) => str(a, 160)).filter(Boolean).slice(0, 8),
    sections,
    nextMoves,
    imagePrompts: { brand: str(ip.brand, 400), space: str(ip.space, 400), product: str(ip.product, 400) },
    finance: buildFinance(raw, currency),
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const prompt = str(body?.prompt, MAX_PROMPT_LENGTH);
    if (prompt.length < 5) {
      return NextResponse.json({ error: "Please describe your business idea (at least a few words)." }, { status: 400 });
    }

    // Login required + daily limit (counts one use). Checked AFTER cheap validation above.
    const claim = await requireLoginAndClaim("magic");
    if (!claim.ok) return NextResponse.json({ error: claim.error }, { status: claim.status });

    // User text goes in the USER message (not the system prompt) to limit prompt-injection.
    const blueprint = await groqJSON<Blueprint>({
      system: SYSTEM_PROMPT,
      user: `Business idea: ${prompt}`,
      validate,
    });

    const id = await saveBlueprint(prompt, blueprint); // null if saving failed (blueprint still returned)
    return NextResponse.json({ ...blueprint, id, usage: { remaining: claim.remaining, limit: claim.limit } });
  } catch (error: any) {
    console.error("[magic] failed:", error?.message || error);
    return NextResponse.json(
      { error: "Could not generate a reliable blueprint right now. Please try again." },
      { status: 502 }
    );
  }
}
