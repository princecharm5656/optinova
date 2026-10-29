"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Image as ImageIcon, Loader2, ArrowLeft, Download, Sparkles } from "lucide-react";
import Container from "@/components/shared/container";
import Section from "@/components/wrapper/section";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic"; 

export default function ImageGeneratorPage() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("realistic");
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("Please describe the image");
      return;
    }
    setLoading(true);
    setError("");
    setImageUrl("");

    try {
      const response = await fetch("/api/tools/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, style }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setImageUrl(data.imageUrl);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!imageUrl) return;
    
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `optinova-${Date.now()}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      alert("Download failed. Right-click image to save instead.");
    }
  };

  return (
    <Section background="base" className="py-12 min-h-screen text-text-base">
      <Container>
        <button onClick={() => router.push("/dashboard")} className="mb-6 flex items-center gap-2 text-text-muted hover:text-cyan-accent">
          <ArrowLeft className="w-4 h-4" />Back to Dashboard
        </button>

        <div className="mb-8 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-400 text-sm">
            <ImageIcon className="w-4 h-4" />
            AI Image Generator
          </div>
          <h1 className="text-4xl md:text-5xl font-bold">
            Generate images with{" "}
            <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">AI</span>
          </h1>
          <p className="text-text-muted">Transform your ideas into stunning visuals</p>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2 space-y-4 bg-elevated/50 border border-base-color rounded-2xl p-6 h-fit">
            <div>
              <label className="block text-sm text-text-muted mb-2">
                Describe your image
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., A futuristic Pakistani city at sunset with cyberpunk vibes..."
                rows={5}
                className="w-full px-4 py-3 bg-base border border-base-color rounded-lg focus:border-pink-400 focus:outline-none resize-none"
              />
              <p className="text-xs text-text-muted mt-2">
                Be specific: colors, mood, style, objects
              </p>
            </div>

            <div>
              <label className="block text-sm text-text-muted mb-2">Style hint (optional)</label>
              <input
                type="text"
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                placeholder="e.g., realistic, anime, watercolor, oil painting"
                className="w-full px-4 py-3 bg-base border border-base-color rounded-lg focus:border-pink-400 focus:outline-none"
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                {error}
              </div>
            )}

            <Button
              onClick={handleGenerate}
              disabled={loading || !prompt.trim()}
              className="w-full bg-pink-500 text-black hover:bg-pink-500/90"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating (10-20 seconds)...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Image
                </>
              )}
            </Button>

            <p className="text-xs text-text-muted text-center">
              Uses 3 AI credits (heavier operation)
            </p>
          </div>

          <div className="lg:col-span-3">
            {imageUrl && (
              <div className="bg-elevated/50 border border-base-color rounded-2xl p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <h2 className="text-sm text-text-muted">Generated Image:</h2>
                  <Button onClick={handleDownload} size="sm" variant="outline">
                    <Download className="w-3 h-3 mr-1" />Download
                  </Button>
                </div>
                <img
                  src={imageUrl}
                  alt={prompt}
                  className="w-full h-auto rounded-xl border border-base-color"
                />
              </div>
            )}

            {loading && (
              <div className="bg-elevated/30 border border-base-color rounded-2xl p-16 text-center">
                <Loader2 className="w-16 h-16 mx-auto text-pink-500 mb-4 animate-spin" />
                <p className="text-text-muted">AI is creating your image (10-20 seconds)...</p>
              </div>
            )}

            {!imageUrl && !loading && (
              <div className="bg-elevated/30 border-2 border-dashed border-base-color rounded-2xl p-16 text-center">
                <ImageIcon className="w-16 h-16 mx-auto text-text-muted mb-4" />
                <p className="text-text-muted">Describe your image to generate</p>
              </div>
            )}
          </div>
        </div>
      </Container>
    </Section>
  );
}
