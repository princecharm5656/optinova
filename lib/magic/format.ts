// 4,500,000 -> "PKR 4.5M"
export const fmt = (n: number, cur: string) => {
  const abs = Math.abs(n);
  const s =
    abs >= 1e9 ? (abs / 1e9).toFixed(1) + "B" :
    abs >= 1e6 ? (abs / 1e6).toFixed(1) + "M" :
    abs >= 1e3 ? Math.round(abs / 1e3) + "K" : String(Math.round(abs));
  return `${n < 0 ? "-" : ""}${cur} ${s.replace(/\.0(?=[MBK]|$)/, "")}`.replace(/^(-?)\s+/, "$1");
};

// chart axis: no currency
export const axisFmt = (n: number) => fmt(n, "").trim();

// "PKR 5.8M – 8.7M"
export const fmtRange = (low: number, high: number, cur: string) =>
  `${fmt(low, cur)} – ${fmt(high, cur).replace(cur + " ", "")}`;
