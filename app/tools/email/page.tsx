"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Copy, Loader2, ArrowLeft, Check } from "lucide-react";
import Container from "@/components/shared/container";
import Section from "@/components/wrapper/section";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default function EmailWriterPage() {
  const router = useRouter();
  const [type, setType] = useState("Cold outreach");
  const [context, setContext] = useState("");
  const [tone, setTone] = useState("Professional");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState({ subject: "", body: "" });
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleGenerate = async () => {
    if (!context.trim()) {
      setError("Please provide context");
      return;
    }
    setLoading(true);
    setError("");
    setResult({ subject: "", body: "" });
    try {
      const response = await fetch("/api/tools/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, context, tone }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!result.body) return;
    setSaving(true);
    try {
      const response = await fetch("/api/tools/email/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          context,
          tone,
          subject: result.subject,
          body: result.body,
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

  const copyEmail = () => {
    const text = `Subject: ${result.subject}\n\n${result.body}`;
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 text-sm">
            <Mail className="w-4 h-4" />
            AI Email Writer
          </div>
          <h1 className="text-4xl md:text-5xl font-bold">
            Write emails that{" "}
            <span className="bg-gradient-to-r from-green-400 to-cyan-accent bg-clip-text text-transparent">get replies</span>
          </h1>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2 space-y-4 bg-elevated/50 border border-base-color rounded-2xl p-6 h-fit">
            <div>
              <label className="block text-sm text-text-muted mb-2">Email Type</label>
              <select value={type} onChange={(e) => setType(e.target.value)} className="w-full px-4 py-3 bg-base border border-base-color rounded-lg focus:border-green-400 focus:outline-none">
                <option>Cold outreach</option>
                <option>Follow-up</option>
                <option>Sales pitch</option>
                <option>Thank you</option>
                <option>Apology</option>
                <option>Introduction</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-text-muted mb-2">Context</label>
              <textarea value={context} onChange={(e) => setContext(e.target.value)} placeholder="What is the email about? Who's the recipient?" rows={5} className="w-full px-4 py-3 bg-base border border-base-color rounded-lg focus:border-green-400 focus:outline-none resize-none" />
            </div>

            <div>
              <label className="block text-sm text-text-muted mb-2">Tone</label>
              <select value={tone} onChange={(e) => setTone(e.target.value)} className="w-full px-4 py-3 bg-base border border-base-color rounded-lg focus:border-green-400 focus:outline-none">
                <option>Professional</option>
                <option>Friendly</option>
                <option>Urgent</option>
                <option>Casual</option>
              </select>
            </div>

            {error && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>}

            <Button onClick={handleGenerate} disabled={loading || !context.trim()} className="w-full bg-green-500 text-black hover:bg-green-500/90" size="lg">
              {loading ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Writing...</>) : (<><Mail className="w-4 h-4 mr-2" />Generate Email</>)}
            </Button>
          </div>

          <div className="lg:col-span-3 space-y-3">
            {result.subject && (
              <div className="bg-elevated/50 border border-base-color rounded-2xl p-6">
                <h2 className="text-sm text-text-muted mb-2">Subject:</h2>
                <p className="text-lg font-semibold mb-4">{result.subject}</p>
                <h2 className="text-sm text-text-muted mb-2">Body:</h2>
                <p className="text-text-base whitespace-pre-wrap">{result.body}</p>
                <div className="flex gap-2 mt-4">
                  <Button onClick={handleSave} disabled={saving} size="sm" variant="outline" className="border-green-500/50 text-green-400">
                    {saving ? "Saving..." : "💾 Save"}
                  </Button>
                  <Button onClick={copyEmail} size="sm" variant="outline">
                    {copied ? <><Check className="w-4 h-4 mr-1" />Copied!</> : <><Copy className="w-4 h-4 mr-1" />Copy Email</>}
                  </Button>
                </div>
              </div>
            )}
            {!result.subject && !loading && (
              <div className="bg-elevated/30 border-2 border-dashed border-base-color rounded-2xl p-12 text-center">
                <Mail className="w-12 h-12 mx-auto text-text-muted mb-3" />
                <p className="text-text-muted">Generate an email to see it here</p>
              </div>
            )}
            {loading && (
              <div className="bg-elevated/30 border border-base-color rounded-2xl p-12 text-center">
                <Loader2 className="w-12 h-12 mx-auto text-green-500 mb-3 animate-spin" />
                <p className="text-text-muted">Writing your email...</p>
              </div>
            )}
          </div>
        </div>
      </Container>
    </Section>
  );
}
