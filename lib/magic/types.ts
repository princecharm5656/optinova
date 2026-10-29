export type SetupItem = { category: string; low: number; high: number; note: string };
export type FixedCost = { category: string; amount: number };
export type MonthPoint = { month: number; revenue: number; profit: number; cumulative: number };

export type Finance = {
  currency: string;
  setupItems: SetupItem[];
  setupLow: number;
  setupHigh: number;
  fixedCosts: FixedCost[];
  fixedTotal: number; // per month
  cogsPercent: number; // cost of goods as % of revenue
  projection: MonthPoint[]; // 24 months, computed in code (not by the AI)
  breakEvenMonth: number | null; // month number (searched up to 60); null => not within 5 years
  month12Revenue: number;
};

export type Blueprint = {
  meta: { businessName: string; tagline: string; summary: string; location: string; currency: string };
  assumptions: string[];
  sections: { title: string; points: { label: string; text: string }[] }[];
  nextMoves: { day: number; title: string; detail: string }[];
  imagePrompts: { brand: string; space: string; product: string };
  finance: Finance;
  usage?: { remaining: number; limit: number }; // added by the API after validation
};
