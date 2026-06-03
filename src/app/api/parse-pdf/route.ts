import { NextRequest, NextResponse } from "next/server";
// @ts-ignore
import pdfParse from "pdf-parse-fork";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "Missing file field in form data" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Parse the PDF buffer using pdf-parse-fork
    const parsedData = await pdfParse(buffer);
    
    if (!parsedData || !parsedData.text) {
      return NextResponse.json(
        { error: "Could not extract text from the PDF file." },
        { status: 400 }
      );
    }

    // Clean up text and perform Unicode Normalization Form C (NFC)
    // This is critical to keep correct Tamil character spacing, ligatures, and glyph structures.
    const normalizedText = parsedData.text
      .normalize("NFC")
      .replace(/\r\n/g, "\n")
      .trim();

    return NextResponse.json({ text: normalizedText });
  } catch (err: any) {
    console.error("PDF Parsing backend error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to parse uploaded PDF file" },
      { status: 500 }
    );
  }
}
export const dynamic = "force-dynamic";
export const maxDuration = 60; // Allow sufficient processing time