"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mic, Upload, Loader2, ArrowLeft, Copy, Check, FileAudio } from "lucide-react";
import Container from "@/components/shared/container";
import Section from "@/components/wrapper/section";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default function TranscribePage() {
  const router = useRouter();
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [language, setLanguage] = useState("en");
  const [loading, setLoading] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 25 * 1024 * 1024) {
        setError("File too large. Max 25MB.");
        return;
      }
      setAudioFile(file);
      setError("");
    }
  };

  const handleTranscribe = async () => {
    if (!audioFile) {
      setError("Please select an audio file");
      return;
    }

    setLoading(true);
    setError("");
    setTranscript("");

    try {
      const formData = new FormData();
      formData.append("audio", audioFile);
      formData.append("language", language);

      const response = await fetch("/api/tools/transcribe", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setTranscript(data.text || "");
    } catch (err: any) {
      setError(err.message || "Transcription failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyTranscript = () => {
    navigator.clipboard.writeText(transcript);
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-400 text-sm">
            <Mic className="w-4 h-4" />
            AI Voice Transcription
          </div>
          <h1 className="text-4xl md:text-5xl font-bold">
            Transcribe audio to{" "}
            <span className="bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">text</span>
          </h1>
          <p className="text-text-muted">
            Convert voice memos, podcasts, interviews to text instantly
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2 space-y-4 bg-elevated/50 border border-base-color rounded-2xl p-6 h-fit">
            <div>
              <label className="block text-sm text-text-muted mb-2">
                Upload audio file
              </label>
              <div className="border-2 border-dashed border-base-color rounded-lg p-8 text-center hover:border-violet-400/50 transition-colors">
                <input
                  type="file"
                  accept="audio/*,video/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="audio-upload"
                />
                <label htmlFor="audio-upload" className="cursor-pointer">
                  <Upload className="w-12 h-12 mx-auto text-text-muted mb-3" />
                  <p className="text-sm text-text-base mb-1">
                    {audioFile ? audioFile.name : "Click to upload"}
                  </p>
                  <p className="text-xs text-text-muted">
                    MP3, WAV, M4A, MP4 (max 25MB)
                  </p>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm text-text-muted mb-2">Language</label>
              <select value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full px-4 py-3 bg-base border border-base-color rounded-lg focus:border-violet-400 focus:outline-none">
                <option value="en">English</option>
                <option value="ur">Urdu</option>
                <option value="hi">Hindi</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="ar">Arabic</option>
              </select>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                {error}
              </div>
            )}

            <Button
              onClick={handleTranscribe}
              disabled={loading || !audioFile}
              className="w-full bg-violet-500 text-white hover:bg-violet-500/90"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Transcribing...
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4 mr-2" />
                  Transcribe
                </>
              )}
            </Button>

            <p className="text-xs text-text-muted text-center">
              Uses 5 AI credits
            </p>
          </div>

          <div className="lg:col-span-3">
            {transcript && (
              <div className="bg-elevated/50 border border-base-color rounded-2xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-sm text-text-muted">Transcript:</h2>
                  <Button onClick={copyTranscript} size="sm" variant="outline">
                    {copied ? (
                      <>
                        <Check className="w-3 h-3 mr-1" />Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 mr-1" />Copy
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-text-base whitespace-pre-wrap leading-relaxed">
                  {transcript}
                </p>
              </div>
            )}

            {loading && (
              <div className="bg-elevated/30 border border-base-color rounded-2xl p-16 text-center">
                <Loader2 className="w-16 h-16 mx-auto text-violet-500 mb-4 animate-spin" />
                <p className="text-text-muted">AI is transcribing your audio...</p>
              </div>
            )}

            {!transcript && !loading && (
              <div className="bg-elevated/30 border-2 border-dashed border-base-color rounded-2xl p-16 text-center">
                <FileAudio className="w-16 h-16 mx-auto text-text-muted mb-4" />
                <p className="text-text-muted">Upload an audio file to transcribe</p>
              </div>
            )}
          </div>
        </div>
      </Container>
    </Section>
  );
}
