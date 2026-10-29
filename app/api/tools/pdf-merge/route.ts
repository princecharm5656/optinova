import { NextRequest, NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";

export async function POST(request: NextRequest) {
  console.log("PDF merge route called");
  try {
    const contentType = request.headers.get("content-type") || "";
    console.log("Content-Type:", contentType);
    
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json(
        { error: "Must use multipart/form-data with pdfs field" },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const files = formData.getAll("pdfs");
    console.log("Files received:", files.length);
    
    const pdfFiles = files.filter((f): f is File => f instanceof File);
    
    if (pdfFiles.length < 2) {
      return NextResponse.json(
        { error: `Need at least 2 PDFs. Got ${pdfFiles.length}.` },
        { status: 400 }
      );
    }

    // Check total payload size
    const totalSize = pdfFiles.reduce((sum, f) => sum + f.size, 0);
    if (totalSize > 4 * 1024 * 1024) {
      return NextResponse.json(
        { error: `Total file size ${(totalSize / 1024 / 1024).toFixed(2)}MB exceeds 4MB limit. Please use smaller PDFs.`    },
        { status: 413 }
      );
    }


    const mergedPdf = await PDFDocument.create();

    for (const file of pdfFiles) {
      console.log("Processing:", file.name, "Type:", file.type, "Size:", file.size);
      
      if (file.type !== "application/pdf") {
        return NextResponse.json(
          { error: `${file.name} is not a PDF (type: ${file.type})` },
          { status: 400 }
        );
      }

      try {
        const bytes = await file.arrayBuffer();
        const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true });
        const pageIndices = pdf.getPageIndices();
        const pages = await mergedPdf.copyPages(pdf, pageIndices);
        pages.forEach((page) => mergedPdf.addPage(page));
        console.log(`Added ${pages.length} pages from ${file.name}`);
      } catch (pdfErr: any) {
        console.error(`Error processing ${file.name}:`, pdfErr);
        return NextResponse.json(
          { error: `Invalid PDF: ${file.name}` },
          { status: 400 }
        );
      }
    }

    const mergedBytes = await mergedPdf.save();
    console.log("Merge complete, size:", mergedBytes.length);

    return new NextResponse(mergedBytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="merged.pdf"',
      },
    });
  } catch (error: any) {
    console.error("PDF merge error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to merge PDFs" },
      { status: 500 }
    );
  }
}
