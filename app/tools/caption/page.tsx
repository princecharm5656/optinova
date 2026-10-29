"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Copy, Loader2, ArrowLeft, Check } from "lucide-react";
import Container from "@/components/shared/container";
import Section from "@/components/wrapper/section";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default function CaptionGeneratorPage() {
  const router = useRouter();
  const [platform, setPlatform] = useState("Instagram");
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("Engaging");
  const [language, setLanguage] = useState("English");
  const [loading, setLoading] = useState(false);
  const [captions, setCaptions] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError("Please enter a topic");
      return;
    }
    setLoading(true);
    setError("");
    setCaptions([]);
    try {
      const response = await fetch("/api/tools/caption", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform, topic, tone, language }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setCaptions(data.captions || []);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (captions.length === 0) return;
    setSaving(true);
    try {
      const response = await fetch("/api/tools/caption/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform, topic, tone, language, captions }),
      });
      const data = await response.json();
      if (data.success) alert("✅ Saved to history!");
      else alert("Error: " + (data.error || "Failed"));
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <Section background="base" className="py-12 min-h-screen text-text-base">
      <Container>
        <button onClick={() => router.push("/dashboard")} className="mb-6 flex items-center gap-2 text-text-muted hover:text-cyan-accent transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        <div className="mb-8 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-accent/10 border border-cyan-accent/30 text-cyan-accent text-sm">
            <Sparkles className="w-4 h-4" />
            AI Caption Generator
          </div>
          <h1 className="text-4xl md:text-5xl font-bold">
            Generate captions that{" "}
            <span className="bg-gradient-to-r from-cyan-accent to-purple-400 bg-clip-text text-transparent">convert</span>
          </h1>
          <p className="text-text-muted">AI-powered captions for Instagram, TikTok, Facebook, LinkedIn.</p>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2 space-y-4 bg-elevated/50 border border-base-color rounded-2xl p-6 h-fit">
            <div>
              <label className="block text-sm text-text-muted mb-2">Platform</label>
              <select value={platform} onChange={(e) => setPlatform(e.target.value)} className="w-full px-4 py-3 bg-base border border-base-color rounded-lg focus:border-cyan-accent focus:outline-none">
                <option>Instagram</option>
                <option>TikTok</option>
                <option>Facebook</option>
                <option>LinkedIn</option>
                <option>Twitter</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-text-muted mb-2">What is your post about?</label>
              <textarea value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g., New coffee shop opening..." rows={3} className="w-full px-4 py-3 bg-base border border-base-color rounded-lg focus:border-cyan-accent focus:outline-none resize-none" />
            </div>

            <button
              onClick={() => setTopic("New artisan coffee shop opening in downtown, hand-roasted beans, cozy atmosphere")}
              className="text-xs text-cyan-accent hover:underline mt-1"
            >
              📝 Try sample topic
            </button>


            <div>
              <label className="block text-sm text-text-muted mb-2">Tone</label>
              <select value={tone} onChange={(e) => setTone(e.target.value)} className="w-full px-4 py-3 bg-base border border-base-color rounded-lg focus:border-cyan-accent focus:outline-none">
                <option>Engaging</option>
                <option>Funny</option>
                <option>Professional</option>
                <option>Inspirational</option>
                <option>Casual</option>
                <option>Educational</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-text-muted mb-2">Language</label>
              <select value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full px-4 py-3 bg-base border border-base-color rounded-lg focus:border-cyan-accent focus:outline-none">
                <option>English</option>
                <option>Roman Urdu</option>
                <option>Hindi</option>
              </select>
            </div>

            {error && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>}

            <Button onClick={handleGenerate} disabled={loading || !topic.trim()} className="w-full bg-cyan-accent text-black hover:bg-cyan-accent/90" size="lg">
              {loading ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating...</>) : (<><Sparkles className="w-4 h-4 mr-2" />Generate Captions</>)}
            </Button>

            <p className="text-xs text-text-muted text-center">Uses 1 AI credit.</p>
          </div>

          <div className="lg:col-span-3 space-y-3">
            {captions.length > 0 && (
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-text-base">{captions.length} Captions Generated</h2>
                <Button onClick={handleSave} disabled={saving} variant="outline" size="sm" className="border-cyan-accent/50 text-cyan-accent">
                  {saving ? "Saving..." : "💾 Save"}
                </Button>
              </div>
            )}

            {captions.length === 0 && !loading && (
              <div className="bg-elevated/30 border-2 border-dashed border-base-color rounded-2xl p-12 text-center">
                <Sparkles className="w-12 h-12 mx-auto text-text-muted mb-3" />
                <p className="text-text-muted">Fill the form and click "Generate"</p>
              </div>
            )}

            {loading && (
              <div className="bg-elevated/30 border border-base-color rounded-2xl p-12 text-center">
                <Loader2 className="w-12 h-12 mx-auto text-cyan-accent mb-3 animate-spin" />
                <p className="text-text-muted">AI is crafting your captions...</p>
              </div>
            )}

            {captions.map((caption, index) => (
              <div key={index} className="bg-elevated/50 border border-base-color rounded-xl p-4 hover:border-cyan-accent/50 transition-all">
                <div className="flex justify-between items-start gap-3">
                  <p className="text-text-base flex-1 whitespace-pre-wrap">{caption}</p>
                  <button onClick={() => handleCopy(caption, index)} className="p-2 rounded-lg hover:bg-base transition-colors text-text-muted hover:text-cyan-accent flex-shrink-0">
                    {copiedIndex === index ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}
