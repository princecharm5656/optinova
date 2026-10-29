"use client";
import React, { useState, useEffect } from "react";
import {
  Sparkles, Send, Loader2, LayoutDashboard, Wand2, TrendingUp, DollarSign, Download,
  CheckCircle2, Circle, ListChecks, AlertTriangle, Info,
} from "lucide-react";
import {
  ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine,
} from "recharts";
import Link from "next/link";
import AiImage, { IMAGE_GAP_MS } from "@/components/magic/ai-image";
import type { Blueprint } from "@/lib/magic/types";

const thinkingSteps = [
  "Initializing Master AI Orchestrator...",
  "Analyzing Market Trends & Competitors...",
  "Calculating Financial Projections...",
  "Designing Brand Visual Identity...",
  "Structuring Operational Roadmap...",
  "Finalizing Empire Blueprint...",
];

const IMAGE_LABELS: Record<string, string> = {
  brand: "Brand Identity",
  space: "Space Concept",
  product: "Product Concept",
};

// 4,500,000 -> "PKR 4.5M"
const fmt = (n: number, cur: string) => {
  const abs = Math.abs(n);
  const s =
    abs >= 1e9 ? (abs / 1e9).toFixed(1) + "B" :
    abs >= 1e6 ? (abs / 1e6).toFixed(1) + "M" :
    abs >= 1e3 ? Math.round(abs / 1e3) + "K" : String(Math.round(abs));
  return `${n < 0 ? "-" : ""}${cur} ${s.replace(/\.0(?=[MBK]|$)/, "")}`;
};
const axisFmt = (n: number) => fmt(n, "").trim();

export default function MagicPage() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Blueprint | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);
  const [runId, setRunId] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [done, setDone] = useState<Record<number, boolean>>({});

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (loading) {
      interval = setInterval(() => {
        setStepIndex((prev) => (prev < thinkingSteps.length - 1 ? prev + 1 : prev));
      }, 1200);
    } else {
      setStepIndex(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleMagicGenerate = async () => {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    setResult(null);
    setError(null);
    setErrorStatus(null);
    setDone({});
    try {
      const response = await fetch("/api/tools/magic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const text = await response.text();
      let data: any;
      try {
        data = JSON.parse(text);
      } catch {
        setErrorStatus(response.status);
        throw new Error(`Server error (${response.status}). Check the terminal running npm run dev.`);
      }
      if (!response.ok || data.error) {
        setErrorStatus(response.status);
        throw new Error(data.error || "Something went wrong.");
      }
      setResult(data as Blueprint);
      setRunId((r) => r + 1);
    } catch (e: any) {
      console.error("Magic Error:", e);
      setError(e?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const f = result?.finance;
  const cur = f?.currency ?? "";
  const doneCount = Object.values(done).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-[#030303] text-gray-200 p-6 font-sans text-base leading-relaxed selection:bg-purple-500/30">
      {/* Header Section */}
      <div className="max-w-6xl mx-auto text-center mt-20 mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-sm mb-6">
          <Sparkles size={14} />
          <span className="font-medium">The Ultimate Business Engine</span>
        </div>
        <h1 className="text-6xl md:text-8xl font-extrabold mb-6 tracking-tighter bg-gradient-to-b from-white via-white to-purple-600 bg-clip-text text-transparent">
          One Prompt. <br /> <span className="text-purple-500">Entire Empire.</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
          Turn one idea into a complete, execution-ready business blueprint.
        </p>
      </div>

      {/* Magic Input Box */}
      <div className="max-w-3xl mx-auto relative mb-16 group">
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-fuchsia-600 to-indigo-600 rounded-3xl blur-2xl opacity-30 group-hover:opacity-60 transition duration-1000"></div>
        <div className="relative bg-[#0f0f0f]/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-4 shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-purple-600/20 rounded-2xl text-purple-400 border border-purple-500/20">
              <Wand2 size={28} />
            </div>
            <textarea
              className="w-full bg-transparent border-none focus:ring-0 focus:outline-none text-xl text-white resize-none placeholder-gray-500 py-3"
              placeholder="Launch a luxury coffee brand in Karachi..."
              rows={2}
              maxLength={400}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleMagicGenerate();
                }
              }}
            />
            <button
              onClick={handleMagicGenerate}
              disabled={loading || !prompt.trim()}
              aria-label="Generate blueprint"
              className="bg-purple-600 hover:bg-purple-500 transition-all p-4 rounded-2xl text-white disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={28} /> : <Send size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && !loading && (
        <div className="max-w-3xl mx-auto mb-12 flex items-start gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-200">
          <AlertTriangle className="shrink-0 mt-0.5" size={20} />
          <div>
            <p>{error}</p>
            {errorStatus === 401 && (
              <Link href="/login" className="inline-block mt-2 font-semibold text-white underline">
                Log in to continue
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Thinking Process Animation */}
      {loading && (
        <div className="max-w-2xl mx-auto text-center space-y-6 animate-pulse">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
              <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-purple-400" size={24} />
            </div>
          </div>
          <p className="text-2xl font-medium text-purple-300">{thinkingSteps[stepIndex]}</p>
          <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
            <div className="bg-purple-500 h-full transition-all duration-500" style={{ width: `${((stepIndex + 1) / thinkingSteps.length) * 100}%` }}></div>
          </div>
        </div>
      )}

      {/* Final Results Dashboard */}
      {result && f && (
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
            <button
              onClick={() => window.print()}
              className="shrink-0 flex items-center gap-2 px-6 py-3 bg-white text-black rounded-full font-bold hover:bg-gray-200 transition-all shadow-xl print:hidden"
            >
              <Download size={20} /> Export PDF
            </button>
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
                  ["Setup Cost", `${fmt(f.setupLow, cur)} – ${fmt(f.setupHigh, cur).replace(cur + " ", "")}`],
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
              <AiImage key={`${runId}-${key}`} prompt={p} label={IMAGE_LABELS[key] || key} autoStart={i === 0 || IMAGE_GAP_MS <= 10_000} />
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
                      onClick={() => setDone((d) => ({ ...d, [i]: !d[i] }))}
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
      )}
    </div>
  );
}
