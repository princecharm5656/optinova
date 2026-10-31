"use client";
import React, { useRef, useState } from "react";
import {
  LayoutDashboard, TrendingUp, DollarSign, Download, CheckCircle2, Circle, ListChecks, Info, Loader2,
} from "lucide-react";
import {
  ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine,
} from "recharts";
import AiImage, { IMAGE_GAP_MS } from "@/components/magic/ai-image";
import { createClient } from "@/lib/supabase/client";
import type { Blueprint } from "@/lib/magic/types";
import { fmt, axisFmt, fmtRange } from "@/lib/magic/format";

const IMAGE_LABELS: Record<string, string> = {
  brand: "Brand Identity",
  space: "Space Concept",
  product: "Product Concept",
};

/**
 * Keeps the Next Moves checklist in state and saves it to the blueprint row (if it has an id).
 * Saving is best-effort: a failed save only logs, the checkbox still works.
 */
export function useDoneState(id: string | null | undefined) {
  const [done, setDone] = useState<Record<number, boolean>>({});
  const doneRef = useRef<Record<number, boolean>>({});
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null);

  const replace = (next: Record<number, boolean>) => {
    doneRef.current = next;
    setDone(next);
  };

  const toggle = (i: number) => {
    const next = { ...doneRef.current, [i]: !doneRef.current[i] };
    replace(next);
    if (!id) return;
    supabaseRef.current ??= createClient();
    supabaseRef.current
      .from("blueprints")
      .update({ done: next })
      .eq("id", id)
      .then(({ error }) => {
        if (error) console.error("[blueprints] could not save progress:", error.message);
      });
  };

  return { done, toggle, replace };
}

type Props = {
  result: Blueprint;
  prompt: string;
  runKey: string | number;
  done: Record<number, boolean>;
  onToggleDone: (i: number) => void;
  /** false for saved blueprints: images are generated on click so opening history doesn't spend image quota */
  autoStartImages?: boolean;
};

export default function BlueprintView({ result, prompt, runKey, done, onToggleDone, autoStartImages = true }: Props) {
  const f = result.finance;
  const cur = f.currency;
  const doneCount = Object.values(done).filter(Boolean).length;
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  // The PDF library is loaded only when needed, so it doesn't slow down the page.
  const exportPdf = async () => {
    if (exporting) return;
    setExporting(true);
    setExportError(null);
    try {
      const { buildBlueprintPdf, downloadPdf, pdfFilename } = await import("@/lib/magic/pdf");
      const bytes = await buildBlueprintPdf(result, prompt, done);
      downloadPdf(bytes, pdfFilename(result.meta.businessName));
    } catch (e) {
      console.error("[pdf] export failed:", e);
      setExportError("Could not create the PDF. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  return (
        <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-10 duration-1000">
          {/* Title row */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 px-4">
            <div>
              <h2 className="text-3xl font-bold flex items-center gap-3 text-white">
                <LayoutDashboard className="text-purple-500" /> {result.meta.businessName}
              </h2>
              {result.meta.tagline && <p className="text-xl text-purple-300 mt-1">{result.meta.tagline}</p>}
              <p className="text-gray-300 mt-3 max-w-3xl">{result.meta.summary}</p>
              <p className="text-sm text-gray-400 mt-2">
                Generated from: “{prompt}”
                {result.usage && <span className="ml-3 text-purple-300">{result.usage.remaining} of {result.usage.limit} blueprints left today</span>}
              </p>
            </div>
            <div className="shrink-0 flex flex-col items-end gap-2 print:hidden">
              <button
                onClick={exportPdf}
                disabled={exporting}
                className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-full font-bold hover:bg-gray-200 transition-all shadow-xl disabled:opacity-60"
              >
                {exporting ? <Loader2 className="animate-spin" size={20} /> : <Download size={20} />}
                {exporting ? "Preparing PDF…" : "Export PDF"}
              </button>
              {exportError && <p className="text-sm text-red-300">{exportError}</p>}
            </div>
          </div>

          {/* Chart + Financial Pulse */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-[#0f0f0f] border border-white/10 p-8 rounded-3xl">
              <div className="flex items-center gap-3 text-purple-300 font-bold text-xl mb-2">
                <TrendingUp size={24} /> 24-Month Projection
              </div>
              <p className="text-sm text-gray-400 mb-6">
                Monthly revenue and profit ({cur}). Calculated from the assumptions on the right.
              </p>
              <div className="h-[340px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={f.projection} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                    <XAxis dataKey="month" stroke="#9ca3af" fontSize={13} tickFormatter={(m) => `M${m}`} interval={2} />
                    <YAxis stroke="#9ca3af" fontSize={13} width={60} tickFormatter={axisFmt} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#121212", border: "1px solid #333", borderRadius: 12 }}
                      labelFormatter={(m: any) => `Month ${m}`}
                      formatter={(v: any, name: any) => [fmt(Number(v), cur), name]}
                    />
                    <Legend wrapperStyle={{ fontSize: 14 }} />
                    <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#8b5cf6" strokeWidth={3} fill="url(#colorRev)" />
                    <Line type="monotone" dataKey="profit" name="Profit" stroke="#34d399" strokeWidth={2.5} dot={false} />
                    {f.breakEvenMonth && f.breakEvenMonth <= 24 && (
                      <ReferenceLine
                        x={f.breakEvenMonth}
                        stroke="#f59e0b"
                        strokeDasharray="4 4"
                        label={{ value: "Break-even", fill: "#f59e0b", fontSize: 13, position: "insideTopLeft" }}
                      />
                    )}
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-900/30 to-indigo-900/30 border border-purple-500/40 p-8 rounded-3xl">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">
                <DollarSign className="text-purple-300" /> Financial Pulse
              </h3>
              <div className="space-y-4">
                {[
                  ["Setup Cost", fmtRange(f.setupLow, f.setupHigh, cur)],
                  ["Monthly Revenue (Month 12)", fmt(f.month12Revenue, cur)],
                  ["Break-even", f.breakEvenMonth
                      ? f.breakEvenMonth <= 24 ? `Month ${f.breakEvenMonth}` : `~Month ${f.breakEvenMonth} (after this chart)`
                      : "Beyond 5 years"],
                ].map(([k, v]) => (
                  <div key={k} className="p-4 bg-white/5 rounded-2xl border border-white/5">
                    <p className="text-gray-300 text-sm">{k}</p>
                    <p className="text-2xl font-bold text-white">{v}</p>
                  </div>
                ))}
              </div>

              <details className="mt-6 group/assume" open>
                <summary className="cursor-pointer text-purple-200 font-semibold flex items-center gap-2">
                  <Info size={16} /> Assumptions
                </summary>
                <ul className="mt-3 space-y-2 text-sm text-gray-200 list-disc pl-5">
                  {result.assumptions.map((a, i) => <li key={i}>{a}</li>)}
                  <li>Cost of goods: {f.cogsPercent}% of revenue.</li>
                </ul>
              </details>
            </div>
          </div>

          {/* Cost breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-[#0f0f0f] border border-white/10 p-8 rounded-3xl">
              <h3 className="text-xl font-bold text-purple-300 mb-6">Setup Cost Breakdown</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-sm text-gray-400 border-b border-white/10">
                      <th className="pb-3 font-medium">Item</th>
                      <th className="pb-3 font-medium text-right">Low</th>
                      <th className="pb-3 font-medium text-right">High</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {f.setupItems.map((i, idx) => (
                      <tr key={idx}>
                        <td className="py-3 pr-4">
                          <p className="text-white font-medium">{i.category}</p>
                          {i.note && <p className="text-sm text-gray-400">{i.note}</p>}
                        </td>
                        <td className="py-3 text-right whitespace-nowrap">{fmt(i.low, cur)}</td>
                        <td className="py-3 text-right whitespace-nowrap">{fmt(i.high, cur)}</td>
                      </tr>
                    ))}
                    <tr className="font-bold text-white border-t border-purple-500/40">
                      <td className="pt-4">Total</td>
                      <td className="pt-4 text-right whitespace-nowrap">{fmt(f.setupLow, cur)}</td>
                      <td className="pt-4 text-right whitespace-nowrap">{fmt(f.setupHigh, cur)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-[#0f0f0f] border border-white/10 p-8 rounded-3xl">
              <h3 className="text-xl font-bold text-purple-300 mb-6">Monthly Running Costs</h3>
              <ul className="space-y-3">
                {f.fixedCosts.map((c, idx) => (
                  <li key={idx} className="flex justify-between gap-4">
                    <span>{c.category}</span>
                    <span className="text-white whitespace-nowrap">{fmt(c.amount, cur)}</span>
                  </li>
                ))}
                <li className="flex justify-between gap-4 pt-3 border-t border-purple-500/40 font-bold text-white">
                  <span>Total / month</span>
                  <span className="whitespace-nowrap">{fmt(f.fixedTotal, cur)}</span>
                </li>
              </ul>
              <p className="text-sm text-gray-400 mt-6">
                AI-generated estimates. Verify with local suppliers and quotes before investing.
              </p>
            </div>
          </div>

          {/* Visuals */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(Object.entries(result.imagePrompts) as [string, string][]).map(([key, p], i) => (
              <AiImage key={`${runKey}-${key}`} prompt={p} label={IMAGE_LABELS[key] || key} autoStart={autoStartImages && (i === 0 || IMAGE_GAP_MS <= 10_000)} />
            ))}
          </div>

          {/* Strategy sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {result.sections.map((s) => (
              <div key={s.title} className="bg-[#0f0f0f] border border-white/10 p-7 rounded-3xl hover:border-purple-500/50 transition-all">
                <div className="flex items-center gap-3 mb-5 text-purple-300 font-semibold text-xl">
                  <LayoutDashboard size={20} /> {s.title}
                </div>
                <div className="space-y-4">
                  {s.points.map((p, i) => (
                    <div key={i}>
                      <p className="text-white font-semibold">{p.label}</p>
                      <p className="text-gray-200">{p.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Next Moves */}
          <div className="bg-gradient-to-br from-purple-900/20 to-transparent border border-purple-500/30 p-8 rounded-3xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                <ListChecks className="text-purple-300" /> Next Moves (7 Days)
              </h3>
              <span className="text-sm text-purple-200">{doneCount}/{result.nextMoves.length} done</span>
            </div>
            <ul className="space-y-3">
              {result.nextMoves.map((m, i) => {
                const checked = !!done[i];
                return (
                  <li key={i}>
                    <button
                      onClick={() => onToggleDone(i)}
                      className="w-full flex items-start gap-4 text-left p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors"
                    >
                      {checked ? <CheckCircle2 className="text-emerald-400 shrink-0 mt-0.5" /> : <Circle className="text-gray-500 shrink-0 mt-0.5" />}
                      <span>
                        <span className={`block font-semibold ${checked ? "text-gray-400 line-through" : "text-white"}`}>
                          Day {m.day}: {m.title}
                        </span>
                        <span className="block text-gray-300 text-sm">{m.detail}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
  );
}
