"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingBag, Copy, Loader2, ArrowLeft, Check, Save } from "lucide-react";
import Container from "@/components/shared/container";
import Section from "@/components/wrapper/section";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic"; 

export default function ProductDescriptionPage() {
  const router = useRouter();
  const [product, setProduct] = useState("");
  const [features, setFeatures] = useState("");
  const [audience, setAudience] = useState("");
  const [tone, setTone] = useState("Persuasive");
  const [loading, setLoading] = useState(false);
  const [descriptions, setDescriptions] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const handleGenerate = async () => {
    if (!product.trim()) {
      setError("Please enter product name");
      return;
    }
    setLoading(true);
    setError("");
    setDescriptions([]);

    try {
      const response = await fetch("/api/tools/product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product, features, audience, tone, count: 3 }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setDescriptions(data.descriptions || []);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (descriptions.length === 0) return;
    setSaving(true);
    try {
      const response = await fetch("/api/tools/caption/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform: "Product",
          topic: product,
          tone,
          language: "English",
          captions: descriptions,
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

  const copyDesc = (text: string, index: number) => {
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm">
            <ShoppingBag className="w-4 h-4" />
            AI Product Description
          </div>
          <h1 className="text-4xl md:text-5xl font-bold">
            Product descriptions that{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-accent bg-clip-text text-transparent">sell</span>
          </h1>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2 space-y-4 bg-elevated/50 border border-base-color rounded-2xl p-6 h-fit">
            <div>
              <label className="block text-sm text-text-muted mb-2">Product Name</label>
              <input type="text" value={product} onChange={(e) => setProduct(e.target.value)} placeholder="e.g., Wireless Earbuds Pro" className="w-full px-4 py-3 bg-base border border-base-color rounded-lg focus:border-emerald-400 focus:outline-none" />
            </div>

            <div>
              <label className="block text-sm text-text-muted mb-2">Key Features (optional)</label>
              <textarea value={features} onChange={(e) => setFeatures(e.target.value)} placeholder="e.g., 24h battery, noise cancellation, waterproof..." rows={3} className="w-full px-4 py-3 bg-base border border-base-color rounded-lg focus:border-emerald-400 focus:outline-none resize-none" />
            </div>

            <div>
              <label className="block text-sm text-text-muted mb-2">Target Audience (optional)</label>
              <input type="text" value={audience} onChange={(e) => setAudience(e.target.value)} placeholder="e.g., Young professionals, fitness enthusiasts..." className="w-full px-4 py-3 bg-base border border-base-color rounded-lg focus:border-emerald-400 focus:outline-none" />
            </div>

            <div>
              <label className="block text-sm text-text-muted mb-2">Tone</label>
              <select value={tone} onChange={(e) => setTone(e.target.value)} className="w-full px-4 py-3 bg-base border border-base-color rounded-lg focus:border-emerald-400 focus:outline-none">
                <option>Persuasive</option>
                <option>Professional</option>
                <option>Casual</option>
                <option>Luxury</option>
                <option>Technical</option>
              </select>
            </div>

            {error && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>}

            <Button onClick={handleGenerate} disabled={loading || !product.trim()} className="w-full bg-emerald-500 text-black hover:bg-emerald-500/90" size="lg">
              {loading ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating...</>) : (<><ShoppingBag className="w-4 h-4 mr-2" />Generate Descriptions</>)}
            </Button>
          </div>

          <div className="lg:col-span-3 space-y-3">
            {descriptions.length > 0 && (
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">{descriptions.length} Descriptions</h2>
                <Button onClick={handleSave} disabled={saving} variant="outline" size="sm" className="border-emerald-500/50 text-emerald-400">
                  {saving ? "Saving..." : <><Save className="w-3 h-3 mr-1" />Save All</>}
                </Button>
              </div>
            )}

            {descriptions.length === 0 && !loading && (
              <div className="bg-elevated/30 border-2 border-dashed border-base-color rounded-2xl p-12 text-center">
                <ShoppingBag className="w-12 h-12 mx-auto text-text-muted mb-3" />
                <p className="text-text-muted">Fill the form to generate product descriptions</p>
              </div>
            )}

            {loading && (
              <div className="bg-elevated/30 border border-base-color rounded-2xl p-12 text-center">
                <Loader2 className="w-12 h-12 mx-auto text-emerald-500 mb-3 animate-spin" />
                <p className="text-text-muted">Crafting descriptions...</p>
              </div>
            )}

            {descriptions.map((desc, i) => (
              <div key={i} className="bg-elevated/50 border border-base-color rounded-xl p-4 hover:border-emerald-400/50 transition-all">
                <div className="flex justify-between items-start gap-3">
                  <p className="text-text-base flex-1">{desc}</p>
                  <button onClick={() => copyDesc(desc, i)} className="p-2 rounded-lg hover:bg-base text-text-muted hover:text-emerald-400 flex-shrink-0">
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
