"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { FileText, Loader2, ArrowLeft, Download, Upload, X, FilePlus } from "lucide-react";
import Container from "@/components/shared/container";
import Section from "@/components/wrapper/section";
import { Button } from "@/components/ui/button";

interface PDFFile {
  name: string;
  size: number;
  file: File;
}

export default function PDFMergePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pdfFiles, setPdfFiles] = useState<PDFFile[]>([]);
  const [merging, setMerging] = useState(false);
  const [mergedUrl, setMergedUrl] = useState<string | null>(null);
  const [mergedSize, setMergedSize] = useState(0);
  const [error, setError] = useState("");

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    const validPdfs = selected.filter((f) => f.type === "application/pdf");

    // NEW: Check file size (Vercel limit)
    const maxSize = 4 * 1024 * 1024; // 4MB per file
    const oversizedFiles = validPdfs.filter((f) => f.size > maxSize);

    if (oversizedFiles.length >0) {
      alert(
        `Files too large for Vercel (4MB limit):\n${oversizedFiles.map((f) => `${f.name}: ${(f.size /1024 / 1024).toFixed(2)}MB`).join('\n')}\n\nPlease use smaller PDFs.`
  );
      return;
    }

    if (validPdfs.length !== selected.length) {
      alert("Only PDF files are accepted");
    }

    const newFiles: PDFFile[] = validPdfs.map((f) => ({
      name: f.name,
      size: f.size,
      file: f,
    }));

    setPdfFiles((prev) => [...prev, ...newFiles]);
    setMergedUrl(null);
    setError("");
  };

  const removeFile = (index: number) => {
    setPdfFiles((prev) => prev.filter((_, i) => i !== index));
    setMergedUrl(null);
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    setPdfFiles((prev) => {
      const arr = [...prev];
      [arr[index - 1], arr[index]] = [arr[index], arr[index - 1]];
      return arr;
    });
  };

  const moveDown = (index: number) => {
    if (index === pdfFiles.length - 1) return;
    setPdfFiles((prev) => {
      const arr = [...prev];
      [arr[index], arr[index + 1]] = [arr[index +1], arr[index]];
      return arr;
    });
  };

  const mergePDFs = async () => {
    if (pdfFiles.length < 2) {
      setError("Add at least 2 PDFs to merge");
      return;
    }

    setMerging(true);
    setError("");

    try {
      const formData = new FormData();
      pdfFiles.forEach((pdf) => {
        formData.append("pdfs", pdf.file);
      });

      const response = await fetch("/api/tools/pdf-merge", {
        method: "POST",
        body: formData,
      });

      // Single read based on response status
      const contentType = response.headers.get("content-type") || "";
      const isError = !response.ok;

      if (isError) {
        // Error path - read as text once
        const errorText = await response.text();
        let errorMsg = `Server error: ${response.status}`;
        try {
          const data = JSON.parse(errorText);
          errorMsg = data.error || errorMsg;
        } catch {}
        throw new Error(errorMsg);
      }

      // Success path - read as blob
      if (!contentType.includes("application/pdf")) {
        const errText = await response.text();
        let errMsg = "Server returned non-PDF response";
        try {
          const data = JSON.parse(errText);
          errMsg = data.error || errMsg;
        } catch {}
        throw new Error(errMsg);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setMergedUrl(url);
      setMergedSize(blob.size);
    } catch (err: any) {
      setError(err.message || "Merge failed");
    } finally {
      setMerging(false);
    }
  };

  const downloadMerged = () => {
    if (!mergedUrl) return;
    const a = document.createElement("a");
    a.href = mergedUrl;
    a.download = "merged.pdf";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
 };

  return (
    <Section background="base" className="py-12 min-h-screen text-text-base">
      <Container>
        <button onClick={() => router.push("/dashboard")}
          className="mb-6 flex items-center gap-2 text-text-muted hover:text-cyan-accent"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        <div className="mb-8 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-sm">
            <FileText className="w-4 h-4" />
            PDF Merge Tool
          </div>
          <h1 className="text-4xl md:text-5xl font-bold">
            Merge PDFs in{" "}
            <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
              one click
            </span>
          </h1>
          <p className="text-text-muted">Combine multiple PDFs into one file</p>
        </div>

        <div className="max-w-3xl mx-auto space-y-6">
          <div className="bg-elevated/50 border-2 border-dashed border-base-color rounded-2xl p-8 text-center">
            <input ref={fileInputRef}
              type="file"
              accept="application/pdf"
              multiple
              onChange={handleFilesChange}
              className="hidden"
              id="pdf-upload"
            />
            <label htmlFor="pdf-upload" className="cursor-pointer block">
              <Upload className="w-12 h-12 mx-auto text-text-muted mb-3" />
              <p className="text-text-base mb-1">Click to upload PDFs</p>
              <p className="text-xs text-text-muted">Multiple files allowed · PDF only</p>
            </label>
          </div>

          {pdfFiles.length > 0 && (
            <div className="bg-elevated/50 border border-base-color rounded-2xl p-6 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{pdfFiles.length} PDFs selected</h3>
                <p className="text-xs text-text-muted">Use arrows to reorder</p>
              </div>

              {pdfFiles.map((pdf, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-base rounded-lg">
                  <FileText className="w-5 h-5 text-orange-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{pdf.name}</p>
                    <p className="text-xs text-text-muted">{formatSize(pdf.size)}</p>
                  </div>
                  <button onClick={() => moveUp(i)}
                    disabled={i === 0}
                    className="p-1 text-text-muted hover:text-text-base disabled:opacity-30"
                  >
                    ↑
 </button>
                  <button
                    onClick={() => moveDown(i)}
                    disabled={i === pdfFiles.length - 1}
                    className="p-1 text-text-muted hover:text-text-base disabled:opacity-30"
                  >
                    ↓
                  </button>
                  <button
                    onClick={() => removeFile(i)}
                    className="p-1 text-red-400 hover:bg-red-500/10 rounded"
 >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <Button
                onClick={mergePDFs}
                disabled={merging || pdfFiles.length < 2}
                className="w-full bg-orange-500 text-black hover:bg-orange-500/90"
                size="lg"
              >
                {merging ? (
 <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Merging...
 </>
 ) : (
                  <>
                    <FilePlus className="w-4 h-4 mr-2" />
                    Merge {pdfFiles.length} PDFs </>
                )}
              </Button>
            </div>
          )}

          {mergedUrl && (
<div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-6 text-center space-y-3">
              <p className="text-green-400 font-semibold text-lg">
                ✅ Merged successfully!
              </p>
              <p className="text-sm text-text-muted">
 Final size: {formatSize(mergedSize)}
              </p>
              <Button onClick={downloadMerged}
                className="bg-cyan-accent text-black hover:bg-cyan-accent/90"
                size="lg"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Merged PDF
              </Button>
            </div>
          )}
        </div>
      </Container>
    </Section>
  );
}
