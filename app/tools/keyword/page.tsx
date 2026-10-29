"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2, ArrowLeft, Copy, Check, Save, TrendingUp } from "lucide-react";
import Container from "@/components/shared/container";
import Section from "@/components/wrapper/section";
import { Button } from "@/components/ui/button";

interface Keyword {
  keyword: string;
  intent: string;
  difficulty: string;
  volume: string;
}

export default function KeywordPage() {
  const router = useRouter();
  const [topic, setTopic] = useState("");
  const [type, setType] = useState("all");
  const [loading, setLoading] = useState(false);
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError("Enter a topic");
      return;
    }
    setLoading(true);
    setError("");
    setKeywords([]);

    try {
      const response = await fetch("/api/tools/keyword", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, type }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setKeywords(data.keywords || []);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const copyKeyword = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopied(index);
    setTimeout(() => setCopied(null), 2000);
  };

  const copyAll = () => {
    const text = keywords.map((k) => k.keyword).join("\n");
    navigator.clipboard.writeText(text);
    alert("✅ All keywords copied!");
  };

  const handleSave = async () => {
    if (keywords.length === 0) return;
    setSaving(true);
    try {
      const response = await fetch("/api/tools/caption/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform: "SEO",
          topic,
          tone: type,
          language: "English",
          captions: keywords.map(k => `${k.keyword} (${k.intent}, ${k.difficulty}, ${k.volume})`),
        }),
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

  const getDifficultyColor = (diff: string) => {
    const d = diff.toLowerCase();
    if (d.includes("easy")) return "text-green-400";
    if (d.includes("hard")) return "text-red-400";
    return "text-yellow-400";
  };

  return (
    <Section background="base" className="py-12 min-h-screen text-text-base">
      <Container>
        <button onClick={() => router.push("/dashboard")} className="mb-6 flex items-center gap-2 text-text-muted hover:text-cyan-accent">
          <ArrowLeft className="w-4 h-4" />Back to Dashboard
        </button>

        <div className="mb-8 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-sm">
            <TrendingUp className="w-4 h-4" />
            AI Keyword Research
          </div>
          <h1 className="text-4xl md:text-5xl font-bold">
            Find keywords that{" "}
            <span className="bg-gradient-to-r from-blue-400 to-cyan-accent bg-clip-text text-transparent">rank</span>
          </h1>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2 space-y-4 bg-elevated/50 border border-base-color rounded-2xl p-6 h-fit">
            <div>
              <label className="block text-sm text-text-muted mb-2">Topic or Niche</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., AI tools for creators"
                className="w-full px-4 py-3 bg-base border border-base-color rounded-lg focus:border-blue-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm text-text-muted mb-2">Keyword Type</label>
              <select value={type} onChange={(e) => setType(e.target.value)} className="w-full px-4 py-3 bg-base border border-base-color rounded-lg focus:border-blue-400 focus:outline-none">
                <option value="all">All Keywords</option>
                <option value="short">Short-tail (1-2 words)</option>
                <option value="long">Long-tail (3-5 words)</option>
                <option value="questions">Question-based</option>
              </select>
            </div>

            {error && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>}

            <Button onClick={handleGenerate} disabled={loading || !topic.trim()} className="w-full bg-blue-500 text-black hover:bg-blue-500/90" size="lg">
              {loading ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Researching...</>) : (<><Search className="w-4 h-4 mr-2" />Find Keywords</>)}
            </Button>
          </div>

          <div className="lg:col-span-3 space-y-3">
            {keywords.length > 0 && (
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">{keywords.length} Keywords Found</h2>
                <div className="flex gap-2">
                  <Button onClick={handleSave} disabled={saving} variant="outline" size="sm" className="border-blue-500/50 text-blue-400">
                    {saving ? "Saving..." : "💾 Save"}
                  </Button>
                  <Button onClick={copyAll} size="sm" variant="outline">
                    Copy All
                  </Button>
                </div>
              </div>
            )}

            {keywords.length === 0 && !loading && (
              <div className="bg-elevated/30 border-2 border-dashed border-base-color rounded-2xl p-12 text-center">
                <Search className="w-12 h-12 mx-auto text-text-muted mb-3" />
                <p className="text-text-muted">Find keywords to see them here</p>
              </div>
            )}

            {loading && (
              <div className="bg-elevated/30 border border-base-color rounded-2xl p-12 text-center">
                <Loader2 className="w-12 h-12 mx-auto text-blue-500 mb-3 animate-spin" />
                <p className="text-text-muted">Finding trending keywords...</p>
              </div>
            )}

            <div className="space-y-2">
              {keywords.map((kw, i) => (
                <div key={i} className="bg-elevated/50 border border-base-color rounded-xl p-4 hover:border-blue-400/50 transition-all">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="text-text-base font-medium">{kw.keyword}</p>
                      <div className="flex flex-wrap gap-2 mt-2 text-xs">
                        <span className="px-2 py-0.5 rounded bg-base text-text-muted">
                          {kw.intent}
                        </span>
                        <span className={`px-2 py-0.5 rounded bg-base ${getDifficultyColor(kw.difficulty)}`}>
                          {kw.difficulty}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-base text-cyan-accent">
                          📊 {kw.volume} volume
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => copyKeyword(kw.keyword, i)}
                      className="p-2 rounded-lg hover:bg-base text-text-muted hover:text-cyan-accent flex-shrink-0"
                    >
                      {copied === i ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
