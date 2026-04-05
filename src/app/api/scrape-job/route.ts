import { NextRequest, NextResponse } from "next/server";
import { scrapeJobPosting } from "@/lib/scraper/job-scraper";

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Basic URL validation
    try {
      new URL(url);
    } catch {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    const result = await scrapeJobPosting(url);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error ?? "Failed to scrape job posting" },
        { status: 422 }
      );
    }

    return NextResponse.json({ text: result.text, title: result.title, company: result.company });
  } catch (err) {
    console.error("Scrape error:", err);
    return NextResponse.json({ error: "Failed to scrape job posting" }, { status: 500 });
  }
}
