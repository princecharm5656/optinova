"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileSearch, Copy, Loader2, ArrowLeft, Check } from "lucide-react";
import Container from "@/components/shared/container";
import Section from "@/components/wrapper/section";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic"; 

export default function SummarizerPage() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [length, setLength] = useState("medium");
  const [format, setFormat] = useState("paragraph");
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);


  const handleSummarize = async () => {
    if (!text.trim()) {
      setError("Please enter text");
      return;
    }
    setLoading(true);
    setError("");
    setSummary("");

    try {
      const response = await fetch("/api/tools/summarizer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, length, format }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setSummary(data.summary || "");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const copySummary = () => {
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async () => {
    if (!summary) return;
    setSaving(true);
    try {
      const response = await fetch("/api/tools/summarizer/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, length, format, summary }),
     });
    const data = await response.json();
    if (data.success) alert("✅ Saved!");
    else alert("Error: " + data.error);
  } catch (err: any) {
    alert("Error: " + err.message);
  } finally {
    setSaving(false);
  }
};


  return (
    <Section background="base" className="py-12 min-h-screen text-text-base">
      <Container>
        <button onClick={() => router.push("/dashboard")} className="mb-6 flex items-center gap-2 text-text-muted hover:text-cyan-accent">
          <ArrowLeft className="w-4 h-4" />Back to Dashboard
        </button>

        <div className="mb-8 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-sm">
            <FileSearch className="w-4 h-4" />
            AI Summarizer
          </div>
          <h1 className="text-4xl md:text-5xl font-bold">
            Summarize long text in{" "}
            <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">seconds</span>
          </h1>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm text-text-muted mb-2">Text to summarize</label>
            <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Paste long article, essay, or any text..." rows={8} className="w-full px-4 py-3 bg-base border border-base-color rounded-lg focus:border-yellow-400 focus:outline-none resize-none" />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-text-muted mb-2">Length</label>
              <select value={length} onChange={(e) => setLength(e.target.value)} className="w-full px-4 py-3 bg-base border border-base-color rounded-lg focus:border-yellow-400 focus:outline-none">
                <option value="short">Short (2-3 sentences)</option>
                <option value="medium">Medium (4-6 sentences)</option>
                <option value="long">Long (8-10 sentences)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-text-muted mb-2">Format</label>
              <select value={format} onChange={(e) => setFormat(e.target.value)} className="w-full px-4 py-3 bg-base border border-base-color rounded-lg focus:border-yellow-400 focus:outline-none">
                <option value="paragraph">Paragraph</option>
                <option value="bullets">Bullet Points</option>
                <option value="tldr">TL;DR + Details</option>
              </select>
            </div>
          </div>

          {error && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>}

          <Button onClick={handleSummarize} disabled={loading || !text.trim()} className="w-full bg-yellow-500 text-black hover:bg-yellow-500/90" size="lg">
            {loading ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Summarizing...</>) : (<><FileSearch className="w-4 h-4 mr-2" />Summarize</>)}
          </Button>

          {summary && (
            <div className="bg-elevated/50 border border-base-color rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm text-text-muted">Summary:</h2>
                <Button onClick={copySummary} size="sm" variant="outline">
                  {copied ? <><Check className="w-3 h-3 mr-1" />Copied!</> : <><Copy className="w-3 h-3 mr-1" />Copy</>}
                </Button>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm text-text-muted">Summary:</h2>
                  <div className="flex gap-2">
                    <Button onClick={handleSave} disabled={saving} size="sm" variant="outline" className="border-yellow-500/50 text-yellow-400">
                      {saving ? "Saving..." : "💾 Save"}
                   </Button>
                   <Button onClick={copySummary} size="sm" variant="outline">
                     {copied ? <><Check className="w-3 h-3 mr-1" />Copied!</> : <><Copy className="w-3 h-3 mr-1" />Copy</>}
                   </Button>
                  </div>
                </div>

              </div>
              <p className="text-text-base whitespace-pre-wrap leading-relaxed">{summary}</p>
            </div>
          )}

          {loading && (
            <div className="bg-elevated/30 border border-base-color rounded-2xl p-12 text-center">
              <Loader2 className="w-12 h-12 mx-auto text-yellow-500 mb-3 animate-spin" />
              <p className="text-text-muted">Summarizing your text...</p>
            </div>
          )}
        </div>
      </Container>
    </Section>
  );
}
