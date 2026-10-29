"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Copy, Loader2, ArrowLeft, Check, Save } from "lucide-react";
import Container from "@/components/shared/container";
import Section from "@/components/wrapper/section";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default function BlogWriterPage() {
  const router = useRouter();
  const [topic, setTopic] = useState("");
  const [keywords, setKeywords] = useState("");
  const [tone, setTone] = useState("Informative");
  const [length, setLength] = useState("medium");
  const [language, setLanguage] = useState("English");
  const [loading, setLoading] = useState(false);
  const [blog, setBlog] = useState({ title: "", content: "" });
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
    setBlog({ title: "", content: "" });

    try {
      const response = await fetch("/api/tools/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, keywords, tone, length, language }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setBlog(data);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!blog.content) return;
    setSaving(true);
    try {
      const response = await fetch("/api/tools/blog/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, keywords, tone, length, language, title: blog.title, content: blog.content }),
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

  const copyBlog = () => {
    navigator.clipboard.writeText(`${blog.title}\n\n${blog.content}`);
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-sm">
            <FileText className="w-4 h-4" />
            AI Blog Writer
          </div>
          <h1 className="text-4xl md:text-5xl font-bold">
            Write blogs that{" "}
            <span className="bg-gradient-to-r from-blue-400 to-cyan-accent bg-clip-text text-transparent">rank & engage</span>
          </h1>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2 space-y-4 bg-elevated/50 border border-base-color rounded-2xl p-6 h-fit">
            <div>
              <label className="block text-sm text-text-muted mb-2">Blog Topic</label>
              <textarea value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g., Benefits of remote work for Pakistani freelancers" rows={3} className="w-full px-4 py-3 bg-base border border-base-color rounded-lg focus:border-blue-400 focus:outline-none resize-none" />
            </div>

            <div>
              <label className="block text-sm text-text-muted mb-2">Target Keywords (optional)</label>
              <input type="text" value={keywords} onChange={(e) => setKeywords(e.target.value)} placeholder="e.g., remote work, freelancing" className="w-full px-4 py-3 bg-base border border-base-color rounded-lg focus:border-blue-400 focus:outline-none" />
            </div>

            <div>
              <label className="block text-sm text-text-muted mb-2">Tone</label>
              <select value={tone} onChange={(e) => setTone(e.target.value)} className="w-full px-4 py-3 bg-base border border-base-color rounded-lg focus:border-blue-400 focus:outline-none">
                <option>Informative</option>
                <option>Casual</option>
                <option>Professional</option>
                <option>Persuasive</option>
                <option>Storytelling</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-text-muted mb-2">Length</label>
              <select value={length} onChange={(e) => setLength(e.target.value)} className="w-full px-4 py-3 bg-base border border-base-color rounded-lg focus:border-blue-400 focus:outline-none">
                <option value="short">Short (400-600 words)</option>
                <option value="medium">Medium (800-1200 words)</option>
                <option value="long">Long (1500-2000 words)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-text-muted mb-2">Language</label>
              <select value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full px-4 py-3 bg-base border border-base-color rounded-lg focus:border-blue-400 focus:outline-none">
                <option>English</option>
                <option>Roman Urdu</option>
                <option>Hindi</option>
              </select>
            </div>

            {error && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>}

            <Button onClick={handleGenerate} disabled={loading || !topic.trim()} className="w-full bg-blue-500 text-black hover:bg-blue-500/90" size="lg">
              {loading ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Writing blog...</>) : (<><FileText className="w-4 h-4 mr-2" />Generate Blog</>)}
            </Button>
          </div>

          <div className="lg:col-span-3 space-y-3">
            {blog.title && (
              <div className="bg-elevated/50 border border-base-color rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-accent bg-clip-text text-transparent">
                    {blog.title}
                  </h2>
                  <div className="flex gap-2">
                    <Button onClick={handleSave} disabled={saving} size="sm" variant="outline" className="border-blue-500/50 text-blue-400">
                      {saving ? "Saving..." : <><Save className="w-3 h-3 mr-1" />Save</>}
                    </Button>
                    <Button onClick={copyBlog} size="sm" variant="outline">
                      {copied ? <><Check className="w-3 h-3 mr-1" />Copied!</> : <><Copy className="w-3 h-3 mr-1" />Copy</>}
                    </Button>
                  </div>
                </div>
                <div className="prose prose-invert max-w-none">
                  <pre className="text-text-base whitespace-pre-wrap font-sans leading-relaxed">{blog.content}</pre>
                </div>
              </div>
            )}
            {!blog.title && !loading && (
              <div className="bg-elevated/30 border-2 border-dashed border-base-color rounded-2xl p-12 text-center">
                <FileText className="w-12 h-12 mx-auto text-text-muted mb-3" />
                <p className="text-text-muted">Generate a blog to see it here</p>
              </div>
            )}
            {loading && (
              <div className="bg-elevated/30 border border-base-color rounded-2xl p-12 text-center">
                <Loader2 className="w-12 h-12 mx-auto text-blue-500 mb-3 animate-spin" />
                <p className="text-text-muted">Writing your blog post (this can take 15-20 seconds)...</p>
              </div>
            )}
          </div>
        </div>
      </Container>
    </Section>
  );
}
