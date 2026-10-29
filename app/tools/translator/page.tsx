"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Languages, Copy, Loader2, ArrowLeft, Check, Save, ArrowRight } from "lucide-react";
import Container from "@/components/shared/container";
import Section from "@/components/wrapper/section";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default function TranslatorPage() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [fromLang, setFromLang] = useState("English");
  const [toLang, setToLang] = useState("Roman Urdu");
  const [loading, setLoading] = useState(false);
  const [translation, setTranslation] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleTranslate = async () => {
    if (!text.trim()) {
      setError("Please enter text");
      return;
    }
    setLoading(true);
    setError("");
    setTranslation("");

    try {
      const response = await fetch("/api/tools/translator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, fromLang, toLang }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setTranslation(data.translation || "");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!translation) return;
    setSaving(true);
    try {
      const response = await fetch("/api/tools/translator/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, fromLang, toLang, translation }),
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

  const copyTranslation = () => {
    navigator.clipboard.writeText(translation);
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-sm">
            <Languages className="w-4 h-4" />
            AI Translator
          </div>
          <h1 className="text-4xl md:text-5xl font-bold">
            Translate to{" "}
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">any language</span>
          </h1>
        </div>

        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-text-muted mb-2">From</label>
              <select value={fromLang} onChange={(e) => setFromLang(e.target.value)} className="w-full px-4 py-3 bg-base border border-base-color rounded-lg focus:border-indigo-400 focus:outline-none">
                <option>English</option>
                <option>Roman Urdu</option>
                <option>Hindi</option>
                <option>Spanish</option>
                <option>French</option>
                <option>Arabic</option>
                <option>German</option>
                <option>Chinese</option>
                <option>Japanese</option>
                <option>Korean</option>
              </select>

            </div>

            <div>
              <label className="block text-sm text-text-muted mb-2">To</label>
              <select value={toLang} onChange={(e) => setToLang(e.target.value)} className="w-full px-4 py-3 bg-base border border-base-color rounded-lg focus:border-indigo-400 focus:outline-none">
                <option>English</option>
                <option>Roman Urdu</option>
                <option>Hindi</option>
                <option>Hindi (Roman)</option>
                <option>Urdu</option>
                <option>Spanish</option>
                <option>French</option>
                <option>Arabic</option>
                <option>German</option>
                <option>Chinese</option>
                <option>Japanese</option>
                <option>Korean</option>
                <option>Portuguese</option>
                <option>Russian</option>
                <option>Italian</option>
              </select>

            </div>
          </div>

          <div>
            <label className="block text-sm text-text-muted mb-2">Text to translate</label>
            <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Type or paste your text here..." rows={6} className="w-full px-4 py-3 bg-base border border-base-color rounded-lg focus:border-indigo-400 focus:outline-none resize-none" />
          </div>

          {error && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>}

          <Button onClick={handleTranslate} disabled={loading || !text.trim()} className="w-full bg-indigo-500 text-white hover:bg-indigo-500/90" size="lg">
            {loading ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Translating...</>) : (<><ArrowRight className="w-4 h-4 mr-2" />Translate</>)}
          </Button>

          {translation && (
            <div className="bg-elevated/50 border border-base-color rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm text-text-muted">Translation ({toLang}):</h2>
                <div className="flex gap-2">
                  <Button onClick={handleSave} disabled={saving} size="sm" variant="outline" className="border-indigo-500/50 text-indigo-400">
                    {saving ? "Saving..." : <><Save className="w-3 h-3 mr-1" />Save</>}
                  </Button>
                  <Button onClick={copyTranslation} size="sm" variant="outline">
                    {copied ? <><Check className="w-3 h-3 mr-1" />Copied!</> : <><Copy className="w-3 h-3 mr-1" />Copy</>}
                  </Button>
                </div>
              </div>
              <p className="text-text-base whitespace-pre-wrap leading-relaxed">{translation}</p>
            </div>
          )}

          {loading && (
            <div className="bg-elevated/30 border border-base-color rounded-2xl p-12 text-center">
              <Loader2 className="w-12 h-12 mx-auto text-indigo-500 mb-3 animate-spin" />
              <p className="text-text-muted">Translating your text...</p>
            </div>
          )}
        </div>
      </Container>
    </Section>
  );
}
