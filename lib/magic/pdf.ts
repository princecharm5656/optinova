import { PDFDocument, PDFFont, PDFPage, StandardFonts, rgb } from "pdf-lib";
import type { Blueprint } from "@/lib/magic/types";
import { fmt, axisFmt, fmtRange } from "@/lib/magic/format";

const PAGE_W = 595.28;
const PAGE_H = 841.89;
const M = 48; // side margin
const CW = PAGE_W - 2 * M; // content width
const BOTTOM = 62; // content stops here (footer lives below)
const TOP_NEXT = PAGE_H - 62; // where content starts on pages 2+

const C = {
  brand: rgb(0.427, 0.157, 0.851),
  brandDark: rgb(0.298, 0.114, 0.584),
  text: rgb(0.067, 0.094, 0.153),
  muted: rgb(0.4, 0.43, 0.49),
  line: rgb(0.88, 0.89, 0.92),
  soft: rgb(0.965, 0.957, 1),
  green: rgb(0.063, 0.65, 0.45),
  amber: rgb(0.9, 0.55, 0.04),
  white: rgb(1, 1, 1),
};

// Standard PDF fonts only support Latin-1/WinAnsi. Map common symbols, drop the rest (emoji, Urdu, etc.).
const REPLACE: Record<string, string> = {
  "→": "->", "←": "<-", "≥": ">=", "≤": "<=", "×": "x", "≈": "~", "−": "-", "‑": "-",
  "\u00a0": " ", "\u200b": "", "✓": "v", "✔": "v", "★": "*",
};

class Writer {
  doc!: PDFDocument;
  regular!: PDFFont;
  bold!: PDFFont;
  italic!: PDFFont;
  pages: PDFPage[] = [];
  page!: PDFPage;
  y = 0;
  private supported = new Set<number>();
  headerName = "";

  static async create() {
    const w = new Writer();
    w.doc = await PDFDocument.create();
    w.regular = await w.doc.embedFont(StandardFonts.Helvetica);
    w.bold = await w.doc.embedFont(StandardFonts.HelveticaBold);
    w.italic = await w.doc.embedFont(StandardFonts.HelveticaOblique);
    w.supported = new Set(w.regular.getCharacterSet());
    return w;
  }

  clean(t: unknown): string {
    let out = "";
    for (const ch of String(t ?? "").replace(/\s+/g, " ")) {
      if (REPLACE[ch] !== undefined) out += REPLACE[ch];
      else if (this.supported.has(ch.codePointAt(0)!)) out += ch;
    }
    return out.trim();
  }

  newPage() {
    this.page = this.doc.addPage([PAGE_W, PAGE_H]);
    this.pages.push(this.page);
    if (this.pages.length > 1) {
      this.page.drawRectangle({ x: 0, y: PAGE_H - 6, width: PAGE_W, height: 6, color: C.brand });
      this.page.drawText("OptiNova", { x: M, y: PAGE_H - 30, size: 9, font: this.bold, color: C.brand });
      const name = this.headerName;
      this.page.drawText(name, { x: PAGE_W - M - this.regular.widthOfTextAtSize(name, 9), y: PAGE_H - 30, size: 9, font: this.regular, color: C.muted });
      this.y = TOP_NEXT;
    }
  }

  need(h: number) {
    if (this.y - h < BOTTOM) this.newPage();
  }

  wrap(text: string, font: PDFFont, size: number, maxW: number): string[] {
    const lines: string[] = [];
    let cur = "";
    for (const word of text.split(" ").filter(Boolean)) {
      const test = cur ? cur + " " + word : word;
      if (font.widthOfTextAtSize(test, size) <= maxW) {
        cur = test;
        continue;
      }
      if (cur) lines.push(cur);
      if (font.widthOfTextAtSize(word, size) > maxW) {
        // a single very long word: break it by characters
        let chunk = "";
        for (const ch of word) {
          if (font.widthOfTextAtSize(chunk + ch, size) > maxW) {
            lines.push(chunk);
            chunk = ch;
          } else chunk += ch;
        }
        cur = chunk;
      } else cur = word;
    }
    if (cur) lines.push(cur);
    return lines;
  }

  /** Wrapped paragraph that flows across pages. */
  para(text: string, o: { font?: PDFFont; size?: number; color?: ReturnType<typeof rgb>; x?: number; width?: number; gap?: number } = {}) {
    const font = o.font ?? this.regular;
    const size = o.size ?? 10.5;
    const x = o.x ?? M;
    const width = o.width ?? CW;
    const lh = size * 1.45;
    for (const line of this.wrap(this.clean(text), font, size, width)) {
      this.need(lh);
      this.page.drawText(line, { x, y: this.y - size, size, font, color: o.color ?? C.text });
      this.y -= lh;
    }
    this.y -= o.gap ?? 0;
  }

  heading(title: string, keepWith = 90) {
    this.need(keepWith); // never leave a heading alone at the bottom of a page
    this.y -= 14;
    this.page.drawText(this.clean(title), { x: M, y: this.y - 13, size: 14, font: this.bold, color: C.brandDark });
    this.y -= 20;
    this.page.drawLine({ start: { x: M, y: this.y }, end: { x: M + CW, y: this.y }, thickness: 1, color: C.brand });
    this.y -= 12;
  }

  right(text: string, rightX: number, y: number, font: PDFFont, size: number, color = C.text) {
    this.page.drawText(text, { x: rightX - font.widthOfTextAtSize(text, size), y, size, font, color });
  }
}

function snapshotBox(w: Writer, x: number, width: number, label: string, value: string) {
  const h = 54;
  w.page.drawRectangle({ x, y: w.y - h, width, height: h, color: C.soft, borderColor: C.line, borderWidth: 1 });
  w.page.drawText(w.clean(label), { x: x + 10, y: w.y - 18, size: 8.5, font: w.regular, color: C.muted });
  let size = 15;
  const v = w.clean(value);
  while (size > 8 && w.bold.widthOfTextAtSize(v, size) > width - 20) size -= 0.5;
  w.page.drawText(v, { x: x + 10, y: w.y - 40, size, font: w.bold, color: C.text });
}

function drawChart(w: Writer, f: Blueprint["finance"]) {
  const H = 150;
  w.need(H + 60);
  const labelW = 46;
  const x0 = M + labelW;
  const x1 = M + CW - 6;
  const top = w.y - 6;
  const bottom = top - H;
  const pts = f.projection;
  const n = pts.length;
  const maxV = Math.max(...pts.map((p) => p.revenue), 1);
  const minV = Math.min(0, ...pts.map((p) => p.profit));
  const sy = (v: number) => bottom + ((v - minV) / (maxV - minV || 1)) * H;
  const sx = (i: number) => x0 + (i / (n - 1)) * (x1 - x0);

  // Round tick values (e.g. 0, 1M, 2M) inside the exact data range, so no space is wasted.
  const raw = (maxV - minV) / 4;
  const pow = Math.pow(10, Math.floor(Math.log10(raw || 1)));
  const frac = raw / pow;
  const step = (frac <= 1 ? 1 : frac <= 2 ? 2 : frac <= 2.5 ? 2.5 : frac <= 5 ? 5 : 10) * pow;
  for (let k = Math.ceil(minV / step); k * step <= maxV + 1e-9; k++) {
    const v = k * step;
    const yy = sy(v);
    const isZero = Math.abs(v) < 1e-9;
    w.page.drawLine({ start: { x: x0, y: yy }, end: { x: x1, y: yy }, thickness: isZero ? 0.9 : 0.5, color: isZero ? C.muted : C.line });
    w.right(axisFmt(v), x0 - 6, yy - 3, w.regular, 8, C.muted);
  }

  for (let i = 0; i < n; i += 3) {
    const label = `M${pts[i].month}`;
    w.page.drawText(label, { x: sx(i) - w.regular.widthOfTextAtSize(label, 8) / 2, y: bottom - 12, size: 8, font: w.regular, color: C.muted });
  }

  const line = (key: "revenue" | "profit", color: ReturnType<typeof rgb>) => {
    for (let i = 0; i < n - 1; i++) {
      w.page.drawLine({ start: { x: sx(i), y: sy(pts[i][key]) }, end: { x: sx(i + 1), y: sy(pts[i + 1][key]) }, thickness: 2, color });
    }
  };
  line("revenue", C.brand);
  line("profit", C.green);

  if (f.breakEvenMonth && f.breakEvenMonth <= n) {
    const bx = sx(f.breakEvenMonth - 1);
    for (let yy = bottom; yy < top; yy += 8) {
      w.page.drawLine({ start: { x: bx, y: yy }, end: { x: bx, y: Math.min(yy + 4, top) }, thickness: 1, color: C.amber });
    }
    w.page.drawText("Break-even", { x: bx + 4, y: top - 9, size: 8, font: w.bold, color: C.amber });
  }

  // legend
  const ly = bottom - 30;
  w.page.drawRectangle({ x: x0, y: ly, width: 10, height: 4, color: C.brand });
  w.page.drawText("Revenue", { x: x0 + 15, y: ly - 1, size: 8.5, font: w.regular, color: C.text });
  w.page.drawRectangle({ x: x0 + 75, y: ly, width: 10, height: 4, color: C.green });
  w.page.drawText("Profit", { x: x0 + 90, y: ly - 1, size: 8.5, font: w.regular, color: C.text });
  w.y = ly - 14;
}

function tableHeader(w: Writer, cols: { text: string; right?: number; x?: number }[]) {
  w.need(24);
  for (const c of cols) {
    if (c.right !== undefined) w.right(c.text, c.right, w.y - 9, w.bold, 8.5, C.muted);
    else w.page.drawText(c.text, { x: c.x ?? M, y: w.y - 9, size: 8.5, font: w.bold, color: C.muted });
  }
  w.y -= 14;
  w.page.drawLine({ start: { x: M, y: w.y }, end: { x: M + CW, y: w.y }, thickness: 0.8, color: C.line });
  w.y -= 4;
}

export async function buildBlueprintPdf(bp: Blueprint, prompt: string, done: Record<number, boolean> = {}): Promise<Uint8Array> {
  const w = await Writer.create();
  const f = bp.finance;
  const cur = f.currency;
  const name = w.clean(bp.meta.businessName) || "Business Blueprint";
  w.headerName = name;

  // ---------- Page 1: brand band + title ----------
  w.newPage();
  w.page.drawRectangle({ x: 0, y: PAGE_H - 92, width: PAGE_W, height: 92, color: C.brand });
  w.page.drawText("OptiNova", { x: M, y: PAGE_H - 52, size: 24, font: w.bold, color: C.white });
  w.page.drawText("AI Business Blueprint", { x: M, y: PAGE_H - 72, size: 11, font: w.regular, color: rgb(0.88, 0.84, 1) });
  const date = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  w.right(date, PAGE_W - M, PAGE_H - 52, w.regular, 10, C.white);
  w.y = PAGE_H - 92 - 30;

  w.para(name, { font: w.bold, size: 26, color: C.text });
  if (bp.meta.tagline) w.para(bp.meta.tagline, { size: 13, color: C.brand, gap: 4 });
  if (bp.meta.summary) w.para(bp.meta.summary, { size: 11, color: C.text, gap: 4 });
  w.para(`Generated from: "${prompt}"`, { font: w.italic, size: 9.5, color: C.muted, gap: 6 });

  // ---------- Financial snapshot ----------
  w.heading("Financial Snapshot");
  const bw = (CW - 24) / 3;
  w.need(60);
  const be = f.breakEvenMonth ? `Month ${f.breakEvenMonth}` : "Beyond 5 years";
  snapshotBox(w, M, bw, "Setup cost", fmtRange(f.setupLow, f.setupHigh, cur));
  snapshotBox(w, M + bw + 12, bw, "Monthly revenue (month 12)", fmt(f.month12Revenue, cur));
  snapshotBox(w, M + 2 * (bw + 12), bw, "Break-even", be);
  w.y -= 54 + 10;

  // ---------- Chart ----------
  w.heading(`24-Month Projection (${cur})`);
  drawChart(w, f);

  // ---------- Assumptions ----------
  w.heading("Assumptions");
  for (const a of [...bp.assumptions, `Cost of goods: ${f.cogsPercent}% of revenue.`]) {
    const lines = w.wrap(w.clean(a), w.regular, 10.5, CW - 14);
    w.need(lines.length * 15 + 2);
    w.page.drawText("•", { x: M + 2, y: w.y - 10.5, size: 10.5, font: w.regular, color: C.brand });
    w.para(a, { x: M + 14, width: CW - 14 });
  }

  // ---------- Setup cost table ----------
  w.heading("Setup Cost Breakdown");
  const rightHigh = M + CW;
  const rightLow = M + CW - 100;
  tableHeader(w, [{ text: "Item", x: M }, { text: "Low", right: rightLow }, { text: "High", right: rightHigh }]);
  for (const it of f.setupItems) {
    const noteLines = it.note ? w.wrap(w.clean(it.note), w.regular, 8.5, 270) : [];
    const rowH = 16 + noteLines.length * 11 + 6;
    w.need(rowH);
    const top = w.y;
    w.page.drawText(w.clean(it.category), { x: M, y: top - 12, size: 10.5, font: w.bold, color: C.text });
    w.right(fmt(it.low, cur), rightLow, top - 12, w.regular, 10.5);
    w.right(fmt(it.high, cur), rightHigh, top - 12, w.regular, 10.5);
    noteLines.forEach((l, i) => w.page.drawText(l, { x: M, y: top - 24 - i * 11, size: 8.5, font: w.regular, color: C.muted }));
    w.y -= rowH;
    w.page.drawLine({ start: { x: M, y: w.y }, end: { x: M + CW, y: w.y }, thickness: 0.4, color: C.line });
  }
  w.need(26);
  w.y -= 4;
  w.page.drawText("Total", { x: M, y: w.y - 14, size: 11, font: w.bold, color: C.brandDark });
  w.right(fmt(f.setupLow, cur), rightLow, w.y - 14, w.bold, 11, C.brandDark);
  w.right(fmt(f.setupHigh, cur), rightHigh, w.y - 14, w.bold, 11, C.brandDark);
  w.y -= 24;

  // ---------- Monthly costs ----------
  w.heading("Monthly Running Costs");
  for (const c of f.fixedCosts) {
    w.need(18);
    w.page.drawText(w.clean(c.category), { x: M, y: w.y - 11, size: 10.5, font: w.regular, color: C.text });
    w.right(fmt(c.amount, cur), M + CW, w.y - 11, w.regular, 10.5);
    w.y -= 18;
    w.page.drawLine({ start: { x: M, y: w.y }, end: { x: M + CW, y: w.y }, thickness: 0.4, color: C.line });
  }
  w.need(24);
  w.y -= 4;
  w.page.drawText("Total / month", { x: M, y: w.y - 14, size: 11, font: w.bold, color: C.brandDark });
  w.right(fmt(f.fixedTotal, cur), M + CW, w.y - 14, w.bold, 11, C.brandDark);
  w.y -= 24;

  // ---------- Strategy sections ----------
  for (const s of bp.sections) {
    w.heading(s.title);
    for (const p of s.points) {
      w.need(34);
      w.para(p.label, { font: w.bold, size: 10.5 });
      w.para(p.text, { size: 10.5, color: C.text, gap: 6 });
    }
  }

  // ---------- Next moves ----------
  w.heading("Next Moves (7 Days)");
  bp.nextMoves.forEach((m, i) => {
    const detailLines = w.wrap(w.clean(m.detail), w.regular, 9.5, CW - 22);
    w.need(18 + detailLines.length * 14 + 8);
    const top = w.y;
    const isDone = !!done[i];
    w.page.drawRectangle({ x: M, y: top - 12, width: 11, height: 11, borderColor: C.brand, borderWidth: 1.2, color: isDone ? C.brand : C.white });
    if (isDone) {
      w.page.drawLine({ start: { x: M + 2.5, y: top - 6.5 }, end: { x: M + 5, y: top - 9.5 }, thickness: 1.4, color: C.white });
      w.page.drawLine({ start: { x: M + 5, y: top - 9.5 }, end: { x: M + 9, y: top - 3.5 }, thickness: 1.4, color: C.white });
    }
    w.page.drawText(w.clean(`Day ${m.day}: ${m.title}`), { x: M + 22, y: top - 11, size: 10.5, font: w.bold, color: C.text });
    w.y -= 18;
    w.para(m.detail, { x: M + 22, width: CW - 22, size: 9.5, color: C.muted, gap: 6 });
  });

  // ---------- Disclaimer ----------
  w.need(70);
  w.y -= 14;
  w.page.drawLine({ start: { x: M, y: w.y }, end: { x: M + CW, y: w.y }, thickness: 0.6, color: C.line });
  w.y -= 8;
  w.para(
    "All figures are AI-generated estimates based on the assumptions listed above. They are not financial advice. Verify costs and revenue with local suppliers, quotes and market research before investing.",
    { font: w.italic, size: 8.5, color: C.muted }
  );

  // ---------- Footers (need total page count) ----------
  const total = w.pages.length;
  w.pages.forEach((pg, i) => {
    pg.drawLine({ start: { x: M, y: 44 }, end: { x: M + CW, y: 44 }, thickness: 0.5, color: C.line });
    pg.drawText("OptiNova  |  AI Business Blueprint", { x: M, y: 30, size: 8, font: w.regular, color: C.muted });
    const label = `Page ${i + 1} of ${total}`;
    pg.drawText(label, { x: M + CW - w.regular.widthOfTextAtSize(label, 8), y: 30, size: 8, font: w.regular, color: C.muted });
  });

  w.doc.setTitle(`${name} - Business Blueprint`);
  w.doc.setAuthor("OptiNova");
  w.doc.setCreator("OptiNova");
  w.doc.setProducer("OptiNova");
  return w.doc.save();
}

/** Browser only: triggers the file download. */
export function downloadPdf(bytes: Uint8Array, filename: string) {
  const blob = new Blob([new Uint8Array(bytes)], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

export const pdfFilename = (businessName: string) =>
  `${(businessName || "business").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "business"}-blueprint.pdf`;
