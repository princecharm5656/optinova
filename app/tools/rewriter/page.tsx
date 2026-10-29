"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, Copy, Loader2, ArrowLeft, Check } from "lucide-react";
import Container from "@/components/shared/container";
import Section from "@/components/wrapper/section";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic"; 

export default function RewriterPage() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [style, setStyle] = useState("improve");
  const [strength, setStrength] = useState("medium");
  const [loading, setLoading] = useState(false);
  const [rewrite, setRewrite] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!rewrite) return;
    setSaving(true);
    try {
      const response = await fetch("/api/tools/rewriter/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, style, strength, rewrite }),
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


  const handleRewrite = async () => {
    if (!text.trim()) {
      setError("Please enter text");
      return;
    }
    setLoading(true);
    setError("");
    setRewrite("");

    try {
      const response = await fetch("/api/tools/rewriter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, style, strength }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setRewrite(data.rewrite || "");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const copyRewrite = () => {
    navigator.clipboard.writeText(rewrite);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Section background="base" className="py-12 min-h-screen text-text-base">
      <Container>
        <button onClick={() => router.push("/dashboard")} className="mb-6 flex items-center gap-2 text-text-muted hover:text-cyan-accent">
          <ArrowLeft className="w-4 h-4" />Back to Dashboard
        </button>

        <div className="mb-8 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-400 text-sm">
            <RefreshCw className="w-4 h-4" />
            AI Rewriter
          </div>
          <h1 className="text-4xl md:text-5xl font-bold">
            Rewrite text in any{" "}
            <span className="bg-gradient-to-r from-pink-400 to-red-400 bg-clip-text text-transparent">style</span>
          </h1>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm text-text-muted mb-2">Original text</label>
            <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Paste text you want to rewrite..." rows={6} className="w-full px-4 py-3 bg-base border border-base-color rounded-lg focus:border-pink-400 focus:outline-none resize-none" />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-text-muted mb-2">Style</label>
              <select value={style} onChange={(e) => setStyle(e.target.value)} className="w-full px-4 py-3 bg-base border border-base-color rounded-lg focus:border-pink-400 focus:outline-none">
                <option value="improve">Improve</option>
                <option value="simplify">Simplify</option>
                <option value="formal">Formal</option>
                <option value="casual">Casual</option>
                <option value="shorten">Shorten</option>
                <option value="expand">Expand</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-text-muted mb-2">Strength</label>
              <select value={strength} onChange={(e) => setStrength(e.target.value)} className="w-full px-4 py-3 bg-base border border-base-color rounded-lg focus:border-pink-400 focus:outline-none">
                <option value="light">Light (minimal changes)</option>
                <option value="medium">Medium (balanced)</option>
                <option value="heavy">Heavy (complete rewrite)</option>
              </select>
            </div>
          </div>

          {error && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>}

          <Button onClick={handleRewrite} disabled={loading || !text.trim()} className="w-full bg-pink-500 text-black hover:bg-pink-500/90" size="lg">
            {loading ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Rewriting...</>) : (<><RefreshCw className="w-4 h-4 mr-2" />Rewrite</>)}
          </Button>

          {rewrite && (
            <div className="bg-elevated/50 border border-base-color rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm text-text-muted">Rewritten text:</h2>
                <Button onClick={copyRewrite} size="sm" variant="outline">
                  {copied ? <><Check className="w-3 h-3 mr-1" />Copied!</> : <><Copy className="w-3 h-3 mr-1" />Copy</>}
                </Button>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm text-text-muted">Rewritten text:</h2>
                  <div className="flex gap-2">
                    <Button onClick={handleSave} disabled={saving} size="sm" variant="outline" className="border-pink-500/50 text-pink-400">
                      {saving ? "Saving..." : "💾 Save"}
                    </Button>
                    <Button onClick={copyRewrite} size="sm" variant="outline">
                      {copied ? <><Check className="w-3 h-3 mr-1" />Copied!</> : <><Copy className="w-3 h-3 mr-1" />Copy</>}
                    </Button>
                  </div>
                </div>

              </div>
              <p className="text-text-base whitespace-pre-wrap leading-relaxed">{rewrite}</p>
            </div>
          )}

          {loading && (
            <div className="bg-elevated/30 border border-base-color rounded-2xl p-12 text-center">
              <Loader2 className="w-12 h-12 mx-auto text-pink-500 mb-3 animate-spin" />
              <p className="text-text-muted">Rewriting your text...</p>
            </div>
          )}
        </div>
      </Container>
    </Section>
  );
}
