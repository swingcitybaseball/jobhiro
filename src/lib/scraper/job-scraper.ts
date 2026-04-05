import * as cheerio from "cheerio";

export interface ScrapedJob {
  title: string;
  company: string;
  text: string;  // full extracted text to feed to AI
  success: boolean;
  error?: string;
}

// Extracts job posting content from a URL using cheerio
export async function scrapeJobPosting(url: string): Promise<ScrapedJob> {
  try {
    const res = await fetch(url, {
      headers: {
        // Pretend to be a browser to avoid basic bot blocks
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
      },
      // 10 second timeout — job sites can be slow
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      return { title: "", company: "", text: "", success: false, error: `HTTP ${res.status}` };
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    // Remove non-content elements
    $("script, style, nav, header, footer, iframe, noscript, .cookie-banner, [class*='nav'], [class*='footer'], [class*='header']").remove();

    // Try to find the main job content — prioritize semantic job containers
    const jobSelectors = [
      '[class*="job-description"]',
      '[class*="jobDescription"]',
      '[class*="job_description"]',
      '[id*="job-description"]',
      '[id*="jobDescription"]',
      '[class*="posting"]',
      '[class*="job-details"]',
      "article",
      "main",
      ".content",
      "#content",
    ];

    let bodyText = "";
    for (const selector of jobSelectors) {
      const el = $(selector).first();
      if (el.length && el.text().trim().length > 200) {
        bodyText = el.text();
        break;
      }
    }

    // Fall back to full body if no specific container found
    if (!bodyText) {
      bodyText = $("body").text();
    }

    // Clean up whitespace
    const cleanText = bodyText
      .replace(/\t/g, " ")
      .replace(/[ ]{3,}/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    // Extract title from page <title> or h1
    const pageTitle = $("title").text().replace(/\s*[-|]\s*.+$/, "").trim();
    const h1 = $("h1").first().text().trim();
    const title = h1 || pageTitle || "Job Position";

    const finalText = cleanText.slice(0, 15000);

    // Detect JS-rendered pages that returned placeholder content instead of real job data
    const jsRenderError = detectJsRenderedPage(finalText);
    if (jsRenderError) {
      return { title: "", company: "", text: "", success: false, error: jsRenderError };
    }

    return {
      title,
      company: extractCompanyFromUrl(url),
      text: finalText,
      success: true,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { title: "", company: "", text: "", success: false, error: message };
  }
}

const FALLBACK_MESSAGE =
  "We couldn't load this job posting automatically. Please switch to \"Paste Text\" and copy the job description directly.";

// Returns an error string if the scraped text looks like a JS-rendered loading screen,
// or null if the text looks like real job content.
function detectJsRenderedPage(text: string): string | null {
  if (text.length < 100) {
    return FALLBACK_MESSAGE;
  }

  const lower = text.toLowerCase();

  // Common JS loading indicators
  const loadingPhrases = [
    "loading...",
    "please wait",
    "please enable javascript",
    "javascript is required",
    "javascript is disabled",
    "enable javascript",
    "this page requires javascript",
    "refresh the page",
    "checking your browser",
    "verifying you are human",
    "just a moment",
    "ddos protection",
    "ray id",           // Cloudflare challenge page
    "challenge-form",  // Cloudflare
    "cf-browser-verification",
  ];

  for (const phrase of loadingPhrases) {
    if (lower.includes(phrase)) {
      return FALLBACK_MESSAGE;
    }
  }

  return null;
}

// Best-effort company name from URL (e.g. "linkedin.com" → "LinkedIn")
function extractCompanyFromUrl(url: string): string {
  try {
    const hostname = new URL(url).hostname.replace("www.", "");
    const parts = hostname.split(".");
    const name = parts[0];
    return name.charAt(0).toUpperCase() + name.slice(1);
  } catch {
    return "";
  }
}
