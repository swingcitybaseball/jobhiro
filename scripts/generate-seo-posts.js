#!/usr/bin/env node
/**
 * SEO Blog Post Generator
 *
 * Three-agent pipeline:
 *   Agent 1 (Sonnet) — content brief from keyword
 *   Agent 2 (Sonnet) — full blog post from brief
 *   Agent 3 (Haiku)  — add CTAs, format meta, output final JSON
 *
 * Usage:
 *   node scripts/generate-seo-posts.js
 *   node scripts/generate-seo-posts.js --keyword "nurse resume tips"
 *   node scripts/generate-seo-posts.js --keywords "nurse resume tips,teacher resume tips"
 */

"use strict";

const Anthropic = require("@anthropic-ai/sdk");
const fs = require("fs");
const path = require("path");

// Load .env.local without requiring dotenv
const envPath = path.join(__dirname, "..", ".env.local");
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, "utf-8")
    .split("\n")
    .forEach((line) => {
      const match = line.match(/^([^#=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const val = match[2].trim().replace(/^["']|["']$/g, "");
        if (!process.env[key]) process.env[key] = val;
      }
    });
}

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const SITE_URL = "https://jobhiro.vercel.app";
const BLOG_DIR = path.join(__dirname, "..", "content", "blog");

// Approximate token costs (USD per 1M tokens) as of 2026-04
const PRICING = {
  "claude-sonnet-4-6": { input: 3.0, output: 15.0 },
  "claude-haiku-4-5-20251001": { input: 0.8, output: 4.0 },
};

// Keyword seed list — add more here and re-run
const DEFAULT_KEYWORDS = [
  // ── Original 15 ────────────────────────────────────────────────────────────
  "software engineer resume tips",
  "data analyst resume tips",
  "nurse resume tips",
  "teacher resume tips",
  "project manager resume tips",
  "marketing manager resume tips",
  "software engineer cover letter example",
  "data analyst cover letter example",
  "nurse cover letter example",
  "how to prepare for software engineer interview",
  "how to prepare for data analyst interview",
  "how to prepare for nursing interview",
  "best resume format 2026",
  "how to tailor resume to job description",
  "AI resume builder vs manual resume",
  // ── Resume Tips ─────────────────────────────────────────────────────────────
  "accountant resume tips",
  "graphic designer resume tips",
  "sales representative resume tips",
  "human resources manager resume tips",
  "customer service resume tips",
  "product manager resume tips",
  "mechanical engineer resume tips",
  "financial analyst resume tips",
  // ── Cover Letter Examples ────────────────────────────────────────────────────
  "registered nurse cover letter example",
  "project manager cover letter example",
  "marketing manager cover letter example",
  "teacher cover letter example",
  "accountant cover letter example",
  "graphic designer cover letter example",
  "sales representative cover letter example",
  // ── Interview Prep ───────────────────────────────────────────────────────────
  "how to prepare for project manager interview",
  "how to prepare for marketing interview",
  "how to prepare for teacher interview",
  "how to prepare for sales interview",
  "how to prepare for customer service interview",
  "how to prepare for accounting interview",
  "how to prepare for HR interview",
  // ── Career Advice ────────────────────────────────────────────────────────────
  "how to write a resume with no experience",
  "resume gaps how to explain",
  "how to write a career change resume",
  "best cover letter format 2026",
  "how long should a resume be",
  "resume vs CV difference",
  "how to follow up after job application",
  "what to wear to a job interview",
  "how to negotiate salary after job offer",
  "behavioral interview questions and answers",
  "STAR method interview examples",
  "remote job resume tips",
  "entry level resume tips no experience",
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

let totalCost = 0;
let totalInputTokens = 0;
let totalOutputTokens = 0;

function trackUsage(model, usage) {
  const rates = PRICING[model] || { input: 3.0, output: 15.0 };
  const cost =
    (usage.input_tokens / 1_000_000) * rates.input +
    (usage.output_tokens / 1_000_000) * rates.output;
  totalCost += cost;
  totalInputTokens += usage.input_tokens;
  totalOutputTokens += usage.output_tokens;
  return cost;
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

function log(step, message) {
  const icons = {
    brief: "📋",
    post: "✍️ ",
    format: "🎨",
    save: "💾",
    skip: "⏭️ ",
    error: "❌",
  };
  console.log(`${icons[step] || "• "} [${step.toUpperCase()}] ${message}`);
}

function stripCodeFences(text) {
  return text
    .trim()
    .replace(/^```json?\n?/, "")
    .replace(/\n?```$/, "")
    .trim();
}

/**
 * Parse JSON that may have unescaped characters inside the "body" HTML field.
 * Tries JSON.parse first; on failure, surgically extracts the body string
 * by finding its boundaries and rebuilds the object from the remaining fields.
 *
 * Strategy: the body is always the last field. Walk backwards from the final `}`
 * to find the body value's closing `"`, regardless of what characters appear inside.
 */
function robustParseJSON(text) {
  // Happy path
  try {
    return JSON.parse(text);
  } catch (_) {}

  const bodyKeyIdx = text.lastIndexOf('"body"');
  if (bodyKeyIdx === -1) throw new Error("No body field found in JSON output");

  // Opening quote of the body value — first `"` after the colon
  const colonIdx = text.indexOf(":", bodyKeyIdx);
  const openQuoteIdx = text.indexOf('"', colonIdx + 1);

  // Walk backwards from the last `}` to find the body's closing `"`
  // (handles any whitespace between the closing quote and the brace)
  const closeBrace = text.lastIndexOf("}");
  let closeQuoteIdx = closeBrace - 1;
  while (closeQuoteIdx > openQuoteIdx && text[closeQuoteIdx] !== '"') {
    closeQuoteIdx--;
  }

  if (closeQuoteIdx <= openQuoteIdx)
    throw new Error("Could not extract body field — unexpected JSON structure");

  // Raw body (may contain unescaped quotes)
  const rawBody = text.slice(openQuoteIdx + 1, closeQuoteIdx);

  // Build clean JSON with body removed, then parse it safely
  const beforeBody = text
    .slice(0, bodyKeyIdx)
    .trimEnd()
    .replace(/,\s*$/, ""); // strip trailing comma
  const cleanJson = beforeBody + "}";

  const parsed = JSON.parse(cleanJson);

  // Unescape standard JSON sequences the model may have emitted
  parsed.body = rawBody
    .replace(/\\"/g, '"')
    .replace(/\\n/g, "\n")
    .replace(/\\t/g, "\t")
    .replace(/\\\\/g, "\\");

  return parsed;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// ---------------------------------------------------------------------------
// Agent 1: Content Brief (Sonnet)
// ---------------------------------------------------------------------------
async function generateBrief(keyword) {
  const model = "claude-sonnet-4-6";
  log("brief", `Generating brief for: "${keyword}"`);

  const response = await client.messages.create({
    model,
    max_tokens: 800,
    messages: [
      {
        role: "user",
        content: `You are an SEO content strategist. Create a content brief for a blog post targeting the keyword: "${keyword}"

Return ONLY a JSON object with this exact shape (no markdown, no explanation):
{
  "targetKeyword": "the exact keyword",
  "secondaryKeywords": ["3-5 related keywords"],
  "questionsToAnswer": ["5 specific questions the post must answer"],
  "suggestedWordCount": 900,
  "angle": "one sentence describing what makes this post different from generic advice",
  "category": "Resume Tips | Cover Letters | Interview Prep | Career Advice"
}`,
      },
    ],
  });

  const cost = trackUsage(model, response.usage);
  console.log(
    `   → ${response.usage.input_tokens}in / ${response.usage.output_tokens}out ($${cost.toFixed(4)})`
  );

  return robustParseJSON(stripCodeFences(response.content[0].text));
}

// ---------------------------------------------------------------------------
// Agent 2: Full Blog Post (Sonnet)
// ---------------------------------------------------------------------------
async function generatePost(keyword, brief) {
  const model = "claude-sonnet-4-6";
  log("post", `Writing post for: "${keyword}"`);

  const questionsText = brief.questionsToAnswer
    .map((q, i) => `${i + 1}. ${q}`)
    .join("\n");

  const response = await client.messages.create({
    model,
    max_tokens: 2000,
    messages: [
      {
        role: "user",
        content: `You are an expert career coach writing a blog post. Write a complete, genuinely useful post targeting the keyword "${brief.targetKeyword}".

Brief:
- Angle: ${brief.angle}
- Target word count: ~${brief.suggestedWordCount} words
- Secondary keywords to include naturally: ${brief.secondaryKeywords.join(", ")}
- Must answer all these questions:
${questionsText}

Format rules:
- Plain, direct prose. No fluff.
- Include specific examples and actionable tips.
- HTML only: use <h2>, <h3>, <p>, <ul>, <li>, <strong> tags.
- Do NOT include <html>, <head>, <body>, or <h1> — body content only.
- Return ONLY the HTML, no preamble or explanation.`,
      },
    ],
  });

  const cost = trackUsage(model, response.usage);
  console.log(
    `   → ${response.usage.input_tokens}in / ${response.usage.output_tokens}out ($${cost.toFixed(4)})`
  );

  return response.content[0].text.trim();
}

// ---------------------------------------------------------------------------
// Agent 3: CTA insertion + meta formatting (Haiku)
// ---------------------------------------------------------------------------
async function formatPost(keyword, brief, rawHtml) {
  const model = "claude-haiku-4-5-20251001";
  log("format", `Formatting and adding CTAs for: "${keyword}"`);

  const slug = slugify(keyword);

  const response = await client.messages.create({
    model,
    max_tokens: 2500,
    messages: [
      {
        role: "user",
        content: `You are formatting a blog post for publication. Process the HTML below and return a single JSON object.

Tasks:
1. Insert 2-3 natural CTAs linking to ${SITE_URL} within the body HTML. Each CTA is a short inline mention or sentence that fits the surrounding text. Use <a href="${SITE_URL}">JobHiro</a>. Place them at natural transition points throughout the post, not all at the end.
2. Write a meta description under 160 characters that includes the keyword "${brief.targetKeyword}".
3. Write an SEO-optimized title that includes the keyword.

Return ONLY this JSON (no code fences, no explanation).
CRITICAL: The body field must be a valid JSON string — escape ALL double quotes inside it as \\", and represent newlines as \\n. Do not use raw unescaped double quotes or literal newlines inside any string value.

{
  "title": "SEO title including the keyword",
  "slug": "${slug}",
  "metaDescription": "under 160 chars",
  "keywords": ${JSON.stringify([brief.targetKeyword, ...brief.secondaryKeywords])},
  "category": "${brief.category}",
  "publishedAt": "${new Date().toISOString()}",
  "body": "full HTML with CTAs inserted — escape all double quotes as \\\""
}

HTML to process:
${rawHtml}`,
      },
    ],
  });

  const cost = trackUsage(model, response.usage);
  console.log(
    `   → ${response.usage.input_tokens}in / ${response.usage.output_tokens}out ($${cost.toFixed(4)})`
  );

  const parsed = robustParseJSON(stripCodeFences(response.content[0].text));
  // Ensure slug is always consistent with the keyword
  parsed.slug = slug;
  return parsed;
}

// ---------------------------------------------------------------------------
// Main pipeline
// ---------------------------------------------------------------------------
async function processKeyword(keyword) {
  const slug = slugify(keyword);
  const outputPath = path.join(BLOG_DIR, `${slug}.json`);

  if (fs.existsSync(outputPath)) {
    log("skip", `Already exists: ${slug}.json`);
    return;
  }

  console.log(`\n${"─".repeat(60)}`);
  console.log(`Keyword: "${keyword}"`);
  console.log("─".repeat(60));

  try {
    const brief = await generateBrief(keyword);
    const rawHtml = await generatePost(keyword, brief);
    const finalPost = await formatPost(keyword, brief, rawHtml);

    fs.writeFileSync(outputPath, JSON.stringify(finalPost, null, 2), "utf-8");
    log("save", `Saved: content/blog/${slug}.json`);
  } catch (err) {
    log("error", `Failed for "${keyword}": ${err.message}`);
    if (err.status === 429) {
      console.log(
        "   Rate limited — waiting 60s before continuing..."
      );
      await sleep(60_000);
    }
  }
}

async function main() {
  let keywords = [...DEFAULT_KEYWORDS];

  const args = process.argv.slice(2);
  const kwIdx = args.indexOf("--keyword");
  const kwsIdx = args.indexOf("--keywords");

  if (kwIdx !== -1 && args[kwIdx + 1]) {
    keywords = [args[kwIdx + 1]];
  } else if (kwsIdx !== -1 && args[kwsIdx + 1]) {
    keywords = args[kwsIdx + 1].split(",").map((k) => k.trim());
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("❌ ANTHROPIC_API_KEY is not set. Add it to .env.local.");
    process.exit(1);
  }

  if (!fs.existsSync(BLOG_DIR)) {
    fs.mkdirSync(BLOG_DIR, { recursive: true });
  }

  console.log(`\n🚀 JobHiro SEO Post Generator`);
  console.log(`   Processing ${keywords.length} keyword(s) sequentially.\n`);

  for (let i = 0; i < keywords.length; i++) {
    await processKeyword(keywords[i]);
    if (i < keywords.length - 1) {
      await sleep(2000); // brief pause between keywords
    }
  }

  console.log(`\n${"═".repeat(60)}`);
  console.log(`✅ Done!`);
  console.log(
    `   Total tokens: ${totalInputTokens.toLocaleString()} in / ${totalOutputTokens.toLocaleString()} out`
  );
  console.log(`   Estimated cost: $${totalCost.toFixed(4)}`);
  console.log("═".repeat(60));
}

main().catch((err) => {
  console.error("Fatal:", err.message);
  process.exit(1);
});
