"use client";
import React, { useState, useEffect } from "react";
import { Sparkles, Send, Loader2, Wand2, AlertTriangle } from "lucide-react";
import Link from "next/link";
import BlueprintView, { useDoneState } from "@/components/magic/blueprint-view";
import type { Blueprint } from "@/lib/magic/types";

const thinkingSteps = [
  "Initializing Master AI Orchestrator...",
  "Analyzing Market Trends & Competitors...",
  "Calculating Financial Projections...",
  "Designing Brand Visual Identity...",
  "Structuring Operational Roadmap...",
  "Finalizing Empire Blueprint...",
];

export default function MagicPage() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Blueprint | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);
  const [runId, setRunId] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const { done, toggle, replace } = useDoneState(result?.id);

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
      replace({});
    } catch (e: any) {
      console.error("Magic Error:", e);
      setError(e?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
        <Link href="/magic/history" className="inline-block mt-4 text-sm text-purple-300 hover:text-white underline">
          My blueprints →
        </Link>
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
      {result && (
        <>
          {!result.id && (
            <p className="max-w-7xl mx-auto mb-4 px-4 text-sm text-amber-300">
              This blueprint could not be saved to your history, so it will disappear if you refresh.
            </p>
          )}
          <BlueprintView
            result={result}
            prompt={prompt}
            runKey={runId}
            done={done}
            onToggleDone={toggle}
          />
        </>
      )}
    </div>
  );
}
