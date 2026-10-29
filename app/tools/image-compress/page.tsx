"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Image as ImageIcon, Loader2, ArrowLeft, Download, Upload, X } from "lucide-react";
import Container from "@/components/shared/container";
import Section from "@/components/wrapper/section";
import { Button } from "@/components/ui/button";

interface CompressedImage {
  name: string;
  originalSize: number;
  compressedSize: number;
  url: string;
  quality: number;
}

export default function ImageCompressPage() {
  const router = useRouter();
  const [original, setOriginal] = useState<string | null>(null);
  const [originalSize, setOriginalSize] = useState(0);
  const [originalName, setOriginalName] = useState("");
  const [quality, setQuality] = useState(70);
  const [compressed, setCompressed] = useState<CompressedImage | null>(null);
  const [processing, setProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

const handleSave = async () => {
  if (!compressed) return;
  
  try {
    const response = await fetch("/api/tools/image-compress/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        originalName: compressed.name,
        originalSize: compressed.originalSize,
        compressedSize: compressed.compressedSize,
        savedPercent: savedPercent,
        quality: compressed.quality,
        imageData: compressed.url,
      }),
    });

    const data = await response.json();
    if (data.success) alert("✅ Saved to history!");
    else alert("Error: " + data.error);
  } catch (err: any) {
    alert("Error: " + err.message);
  }
};


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    setOriginalName(file.name);
    setOriginalSize(file.size);
    setCompressed(null);

    const reader = new FileReader();
    reader.onload = (e) => setOriginal(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const compressImage = async () => {
    if (!original) return;
    setProcessing(true);

    const img = new Image();
    img.src = original;
    await new Promise((resolve) => (img.onload = resolve));

    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(img, 0, 0);

    const compressedDataUrl = canvas.toDataURL("image/jpeg", quality / 100);
    const compressedSize = Math.round((compressedDataUrl.length * 3) / 4);

    setCompressed({
      name: originalName.replace(/\.[^.]+$/, ".jpg"),
      originalSize,
      compressedSize,
      url: compressedDataUrl,
      quality,
    });

    setProcessing(false);
  };

  const downloadCompressed = () => {
    if (!compressed) return;
    const a = document.createElement("a");
    a.href = compressed.url;
    a.download = compressed.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const reset = () => {
    setOriginal(null);
    setOriginalSize(0);
    setOriginalName("");
    setCompressed(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  };

  const savedPercent = compressed
    ? Math.round((1 - compressed.compressedSize / compressed.originalSize) * 100)
    : 0;

  return (
    <Section background="base" className="py-12 min-h-screen text-text-base">
      <Container>
        <button onClick={() => router.push("/dashboard")} className="mb-6 flex items-center gap-2 text-text-muted hover:text-cyan-accent">
          <ArrowLeft className="w-4 h-4" />Back to Dashboard
        </button>

        <div className="mb-8 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-400 text-sm">
            <ImageIcon className="w-4 h-4" />
            Image Compressor
          </div>
          <h1 className="text-4xl md:text-5xl font-bold">
            Compress images in{" "}
            <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">seconds</span>
          </h1>
          <p className="text-text-muted">Reduce file size by 50-80% without losing quality</p>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {!original ? (
            <div className="bg-elevated/50 border-2 border-dashed border-base-color rounded-2xl p-12 text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="img-upload"
              />
              <label htmlFor="img-upload" className="cursor-pointer block">
                <Upload className="w-16 h-16 mx-auto text-text-muted mb-4" />
                <p className="text-text-base mb-2">Click to upload image</p>
                <p className="text-xs text-text-muted">JPG, PNG, WebP (any size)</p>
              </label>
            </div>
          ) : (
            <>
              <div className="bg-elevated/50 border border-base-color rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-text-muted">
                    Original: <span className="text-text-base font-medium">{originalName}</span> ({formatSize(originalSize)})
                  </p>
                  <Button onClick={reset} variant="ghost" size="sm">
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <img src={original} alt="Original" className="max-h-64 mx-auto rounded-lg" />

                <div>
                  <label className="block text-sm text-text-muted mb-2">
                    Quality: {quality}%
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={quality}
                    onChange={(e) => setQuality(Number(e.target.value))}
                    className="w-full accent-pink-500"
                  />
                  <div className="flex justify-between text-xs text-text-muted mt-1">
                    <span>Smaller file</span>
                    <span>Better quality</span>
                  </div>
                </div>

                <Button onClick={compressImage} disabled={processing} className="w-full bg-pink-500 text-black" size="lg">
                  {processing ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Compressing...</>
                  ) : (
                    <>Compress Image</>
                  )}
                </Button>
              </div>

              {compressed && (
                <div className="bg-elevated/50 border border-base-color rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <p className="text-sm text-text-muted">Compressed:</p>
                      <p className="text-text-base font-medium">{compressed.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-green-400 font-bold">
                        ✅ {savedPercent}% smaller!
                      </p>
                      <p className="text-xs text-text-muted">
                        {formatSize(compressed.originalSize)} → {formatSize(compressed.compressedSize)}
                      </p>
                    </div>
                  </div>    

                  <img src={compressed.url} alt="Compressed" className="max-h-64 mx-auto rounded-lg" />

                  <Button onClick={downloadCompressed} className="w-full bg-cyan-accent text-black" size="lg">
                    <Download className="w-4 h-4 mr-2" />
                    Download Compressed
                  </Button>

                  <Button onClick={handleSave} variant="outline" className="w-full mt-2 border-cyan-accent/50 text-cyan-accent">
                    💾 Save to History
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </Container>
    </Section>
  );
}
