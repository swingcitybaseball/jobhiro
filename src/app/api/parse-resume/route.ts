import { NextRequest, NextResponse } from "next/server";
import { parseResumePdf } from "@/lib/parser/resume-parser";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "Only PDF files are supported" }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const text = await parseResumePdf(buffer);

    if (!text || text.length < 50) {
      return NextResponse.json({ error: "Could not extract text from PDF" }, { status: 422 });
    }

    return NextResponse.json({ text });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Resume parse error:", message);
    return NextResponse.json({ error: `Failed to parse resume: ${message}` }, { status: 500 });
  }
}
