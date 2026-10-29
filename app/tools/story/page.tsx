"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Copy, Loader2, ArrowLeft, Check } from "lucide-react";
import Container from "@/components/shared/container";
import Section from "@/components/wrapper/section";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic"; 

export default function StoryGeneratorPage() {
  const router = useRouter();
  const [topic, setTopic] = useState("");
  const [style, setStyle] = useState("Adventure");
  const [length, setLength] = useState("short");
  const [loading, setLoading] = useState(false);
  const [story, setStory] = useState({ title: "", content: "" });
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
    setStory({ title: "", content: "" });
    try {
      const response = await fetch("/api/tools/story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, style, length }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setStory(data);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!story.content) return;
    setSaving(true);
    try {
      const response = await fetch("/api/tools/story/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          style,
          length,
          title: story.title,
          content: story.content,
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

  const copyStory = () => {
    navigator.clipboard.writeText(`${story.title}\n\n${story.content}`);
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-sm">
            <BookOpen className="w-4 h-4" />
            AI Story Generator
          </div>
          <h1 className="text-4xl md:text-5xl font-bold">
            Stories that{" "}
            <span className="bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent">captivate</span>
          </h1>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2 space-y-4 bg-elevated/50 border border-base-color rounded-2xl p-6 h-fit">
            <div>
              <label className="block text-sm text-text-muted mb-2">Story Topic / Premise</label>
              <textarea value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g., A traveler discovers a hidden café between dimensions..." rows={3} className="w-full px-4 py-3 bg-base border border-base-color rounded-lg focus:border-orange-400 focus:outline-none resize-none" />
            </div>

            <div>
              <label className="block text-sm text-text-muted mb-2">Style</label>
              <select value={style} onChange={(e) => setStyle(e.target.value)} className="w-full px-4 py-3 bg-base border border-base-color rounded-lg focus:border-orange-400 focus:outline-none">
                <option>Adventure</option>
                <option>Mystery</option>
                <option>Romance</option>
                <option>Sci-Fi</option>
                <option>Fantasy</option>
                <option>Horror</option>
                <option>Comedy</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-text-muted mb-2">Length</label>
              <select value={length} onChange={(e) => setLength(e.target.value)} className="w-full px-4 py-3 bg-base border border-base-color rounded-lg focus:border-orange-400 focus:outline-none">
                <option value="short">Short (150-300 words)</option>
                <option value="medium">Medium (400-600 words)</option>
              </select>
            </div>

            {error && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>}

            <Button onClick={handleGenerate} disabled={loading || !topic.trim()} className="w-full bg-orange-500 text-black hover:bg-orange-500/90" size="lg">
              {loading ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Writing...</>) : (<><BookOpen className="w-4 h-4 mr-2" />Generate Story</>)}
            </Button>
          </div>

          <div className="lg:col-span-3 space-y-3">
            {story.title && (
              <div className="bg-elevated/50 border border-base-color rounded-2xl p-6">
                <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent">
                  {story.title}
                </h2>
                <p className="text-text-base whitespace-pre-wrap leading-relaxed">{story.content}</p>
                <div className="flex gap-2 mt-4">
                  <Button onClick={handleSave} disabled={saving} size="sm" variant="outline" className="border-orange-500/50 text-orange-400">
                    {saving ? "Saving..." : "💾 Save"}
                  </Button>
                  <Button onClick={copyStory} size="sm" variant="outline">
                    {copied ? <><Check className="w-4 h-4 mr-1" />Copied!</> : <><Copy className="w-4 h-4 mr-1" />Copy Story</>}
                  </Button>
                </div>
              </div>
            )}
            {!story.title && !loading && (
              <div className="bg-elevated/30 border-2 border-dashed border-base-color rounded-2xl p-12 text-center">
                <BookOpen className="w-12 h-12 mx-auto text-text-muted mb-3" />
                <p className="text-text-muted">Generate a story to see it here</p>
              </div>
            )}
            {loading && (
              <div className="bg-elevated/30 border border-base-color rounded-2xl p-12 text-center">
                <Loader2 className="w-12 h-12 mx-auto text-orange-500 mb-3 animate-spin" />
                <p className="text-text-muted">Writing your story...</p>
              </div>
            )}
          </div>
        </div>
      </Container>
    </Section>
  );
}
