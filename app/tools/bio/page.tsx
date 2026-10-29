"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Copy, Loader2, ArrowLeft, Check } from "lucide-react";
import Container from "@/components/shared/container";
import Section from "@/components/wrapper/section";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default function BioGeneratorPage() {
  const router = useRouter();
  const [platform, setPlatform] = useState("Instagram");
  const [name, setName] = useState("");
  const [about, setAbout] = useState("");
  const [tone, setTone] = useState("Professional");
  const [loading, setLoading] = useState(false);
  const [bios, setBios] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const handleGenerate = async () => {
    if (!about.trim()) {
      setError("Please describe yourself");
      return;
    }
    setLoading(true);
    setError("");
    setBios([]);
    try {
      const response = await fetch("/api/tools/bio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform, name, about, tone }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setBios(data.bios || []);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (bios.length === 0) return;
    setSaving(true);
    try {
      const response = await fetch("/api/tools/bio/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform, name, about, tone, bios }),
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

  const copyBio = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopied(index);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <Section background="base" className="py-12 min-h-screen text-text-base">
      <Container>
        <button onClick={() => router.push("/dashboard")} className="mb-6 flex items-center gap-2 text-text-muted hover:text-cyan-accent">
          <ArrowLeft className="w-4 h-4" />Back to Dashboard
        </button>

        <div className="mb-8 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-accent/10 border border-cyan-accent/30 text-cyan-accent text-sm">
            <User className="w-4 h-4" />
            AI Bio Generator
          </div>
          <h1 className="text-4xl md:text-5xl font-bold">
            Craft the perfect{" "}
            <span className="bg-gradient-to-r from-cyan-accent to-purple-400 bg-clip-text text-transparent">bio</span>
          </h1>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2 space-y-4 bg-elevated/50 border border-base-color rounded-2xl p-6 h-fit">
            <div>
              <label className="block text-sm text-text-muted mb-2">Platform</label>
              <select value={platform} onChange={(e) => setPlatform(e.target.value)} className="w-full px-4 py-3 bg-base border border-base-color rounded-lg focus:border-cyan-accent focus:outline-none">
                <option>Instagram</option>
                <option>Twitter</option>
                <option>LinkedIn</option>
                <option>TikTok</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-text-muted mb-2">Your Name (optional)</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Ahmed Khan" className="w-full px-4 py-3 bg-base border border-base-color rounded-lg focus:border-cyan-accent focus:outline-none" />
            </div>

            <div>
              <label className="block text-sm text-text-muted mb-2">Tell us about yourself</label>
              <textarea value={about} onChange={(e) => setAbout(e.target.value)} placeholder="e.g., Freelance designer from Pakistan..." rows={4} className="w-full px-4 py-3 bg-base border border-base-color rounded-lg focus:border-cyan-accent focus:outline-none resize-none" />
            </div>

            <div>
              <label className="block text-sm text-text-muted mb-2">Tone</label>
              <select value={tone} onChange={(e) => setTone(e.target.value)} className="w-full px-4 py-3 bg-base border border-base-color rounded-lg focus:border-cyan-accent focus:outline-none">
                <option>Professional</option>
                <option>Casual</option>
                <option>Funny</option>
                <option>Inspirational</option>
                <option>Creative</option>
              </select>
            </div>

            {error && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>}

            <Button onClick={handleGenerate} disabled={loading || !about.trim()} className="w-full bg-cyan-accent text-black hover:bg-cyan-accent/90" size="lg">
              {loading ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating...</>) : (<><User className="w-4 h-4 mr-2" />Generate Bios</>)}
            </Button>
          </div>

          <div className="lg:col-span-3 space-y-3">
            {bios.length > 0 && (
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">{bios.length} Bio Options</h2>
                <Button onClick={handleSave} disabled={saving} variant="outline" size="sm" className="border-cyan-accent/50 text-cyan-accent">
                  {saving ? "Saving..." : "💾 Save"}
                </Button>
              </div>
            )}

            {bios.length === 0 && !loading && (
              <div className="bg-elevated/30 border-2 border-dashed border-base-color rounded-2xl p-12 text-center">
                <User className="w-12 h-12 mx-auto text-text-muted mb-3" />
                <p className="text-text-muted">Generate bios to see them here</p>
              </div>
            )}

            {loading && (
              <div className="bg-elevated/30 border border-base-color rounded-2xl p-12 text-center">
                <Loader2 className="w-12 h-12 mx-auto text-cyan-accent mb-3 animate-spin" />
                <p className="text-text-muted">Crafting bios...</p>
              </div>
            )}

            {bios.map((bio, i) => (
              <div key={i} className="bg-elevated/50 border border-base-color rounded-xl p-4 hover:border-cyan-accent/50 transition-all">
                <div className="flex justify-between items-start gap-3">
                  <p className="text-text-base flex-1">{bio}</p>
                  <button onClick={() => copyBio(bio, i)} className="p-2 rounded-lg hover:bg-base text-text-muted hover:text-cyan-accent flex-shrink-0">
                    {copied === i ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
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
