"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Hash, Copy, Loader2, ArrowLeft, Check } from "lucide-react";
import Container from "@/components/shared/container";
import Section from "@/components/wrapper/section";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic"; 

export default function HashtagGeneratorPage() {
  const router = useRouter();
  const [platform, setPlatform] = useState("Instagram");
  const [topic, setTopic] = useState("");
  const [niche, setNiche] = useState("");
  const [loading, setLoading] = useState(false);
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError("Please enter a topic");
      return;
    }
    setLoading(true);
    setError("");
    setHashtags([]);
    try {
      const response = await fetch("/api/tools/hashtag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform, topic, niche }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setHashtags(data.hashtags || []);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (hashtags.length === 0) return;
    setSaving(true);
    try {
      const response = await fetch("/api/tools/hashtag/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform, topic, niche, hashtags }),
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

  const handleCopyAll = () => {
    const text = hashtags.map((h) => `#${h}`).join(" ");
    navigator.clipboard.writeText(text);
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-400/10 border border-purple-400/30 text-purple-400 text-sm">
            <Hash className="w-4 h-4" />
            AI Hashtag Generator
          </div>
          <h1 className="text-4xl md:text-5xl font-bold">
            Trending hashtags for{" "}
            <span className="bg-gradient-to-r from-purple-400 to-cyan-accent bg-clip-text text-transparent">maximum reach</span>
          </h1>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2 space-y-4 bg-elevated/50 border border-base-color rounded-2xl p-6 h-fit">
            <div>
              <label className="block text-sm text-text-muted mb-2">Platform</label>
              <select value={platform} onChange={(e) => setPlatform(e.target.value)} className="w-full px-4 py-3 bg-base border border-base-color rounded-lg focus:border-purple-400 focus:outline-none">
                <option>Instagram</option>
                <option>TikTok</option>
                <option>Twitter</option>
                <option>LinkedIn</option>
                <option>YouTube</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-text-muted mb-2">Topic / Post content</label>
              <textarea value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g., Coffee shop opening..." rows={3} className="w-full px-4 py-3 bg-base border border-base-color rounded-lg focus:border-purple-400 focus:outline-none resize-none" />
            </div>

            <div>
              <label className="block text-sm text-text-muted mb-2">Niche (optional)</label>
              <input type="text" value={niche} onChange={(e) => setNiche(e.target.value)} placeholder="e.g., Travel, Food, Tech..." className="w-full px-4 py-3 bg-base border border-base-color rounded-lg focus:border-purple-400 focus:outline-none" />
            </div>

            {error && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>}

            <Button onClick={handleGenerate} disabled={loading || !topic.trim()} className="w-full bg-purple-400 text-black hover:bg-purple-400/90" size="lg">
              {loading ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating...</>) : (<><Hash className="w-4 h-4 mr-2" />Generate Hashtags</>)}
            </Button>
          </div>

          <div className="lg:col-span-3 space-y-3">
            {hashtags.length > 0 && (
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">{hashtags.length} Hashtags</h2>
                <div className="flex gap-2">
                  <Button onClick={handleSave} disabled={saving} variant="outline" size="sm" className="border-purple-400/50 text-purple-400">
                    {saving ? "Saving..." : "💾 Save"}
                  </Button>
                  <Button onClick={handleCopyAll} size="sm" variant="outline">
                    {copied ? <><Check className="w-4 h-4 mr-1" />Copied!</> : <><Copy className="w-4 h-4 mr-1" />Copy All</>}
                  </Button>
                </div>
              </div>
            )}

            {hashtags.length === 0 && !loading && (
              <div className="bg-elevated/30 border-2 border-dashed border-base-color rounded-2xl p-12 text-center">
                <Hash className="w-12 h-12 mx-auto text-text-muted mb-3" />
                <p className="text-text-muted">Generate hashtags to see them here</p>
              </div>
            )}

            {loading && (
              <div className="bg-elevated/30 border border-base-color rounded-2xl p-12 text-center">
                <Loader2 className="w-12 h-12 mx-auto text-purple-400 mb-3 animate-spin" />
                <p className="text-text-muted">Finding trending tags...</p>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {hashtags.map((tag, i) => (
                <div key={i} className="px-3 py-1.5 rounded-full bg-elevated border border-base-color text-sm hover:border-purple-400/50 transition-colors">
                  #{tag}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
