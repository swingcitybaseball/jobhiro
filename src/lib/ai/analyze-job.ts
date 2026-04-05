import { anthropic, SONNET_MODEL } from "./client";
import { buildMatchScorePrompt } from "./prompts/match-score";
import { buildTailorResumePrompt } from "./prompts/tailor-resume";
import { buildCoverLetterPrompt } from "./prompts/cover-letter";
import { buildInterviewPrepPrompt } from "./prompts/interview-prep";
import { buildCompanyIntelPrompt } from "./prompts/company-intel";
import type { AnalysisResult, MatchScoreBreakdown, InterviewQuestion } from "@/types";

// Calls Claude for a single prompt and returns the text response
async function callClaude(prompt: string): Promise<string> {
  const response = await anthropic.messages.create({
    model: SONNET_MODEL,
    max_tokens: 4096,
    messages: [{ role: "user", content: prompt }],
  });

  const block = response.content[0];
  if (block.type !== "text") throw new Error("Unexpected response type from Claude");
  return block.text;
}

// Parse JSON from Claude response — strips markdown code fences if present
function parseJSON<T>(text: string): T {
  const cleaned = text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();
  return JSON.parse(cleaned) as T;
}

// Extracts job title and company name from raw job posting text
function buildJobMetaPrompt(jobText: string): string {
  return `Extract the job title and company name from this job posting. If the company name is not mentioned, use "Unknown Company". Respond with ONLY valid JSON — no markdown, no extra text:
{"title": "<job title>", "company": "<company name>"}

JOB POSTING:
${jobText.slice(0, 3000)}`;
}

// Main orchestrator — runs all 6 calls in parallel for speed
export async function analyzeJob(
  jobText: string,
  resumeText: string,
  jobUrl?: string
): Promise<AnalysisResult> {
  const id = crypto.randomUUID();

  // Run all AI calls concurrently to minimize total wait time
  const [matchScoreRaw, tailoredResume, coverLetter, interviewPrepRaw, companyIntel, jobMetaRaw] =
    await Promise.all([
      callClaude(buildMatchScorePrompt(jobText, resumeText)),
      callClaude(buildTailorResumePrompt(jobText, resumeText)),
      callClaude(buildCoverLetterPrompt(jobText, resumeText)),
      callClaude(buildInterviewPrepPrompt(jobText, resumeText)),
      callClaude(buildCompanyIntelPrompt(jobText, resumeText)),
      callClaude(buildJobMetaPrompt(jobText)),
    ]);

  // Parse structured JSON outputs
  const matchScore = parseJSON<MatchScoreBreakdown>(matchScoreRaw);
  const interviewPrepData = parseJSON<{ questions: InterviewQuestion[] }>(interviewPrepRaw);
  const jobMeta = parseJSON<{ title: string; company: string }>(jobMetaRaw);

  return {
    id,
    jobData: {
      title: jobMeta.title || "Unknown Position",
      company: jobMeta.company || "Unknown Company",
      description: jobText,
      rawText: jobText,
    },
    matchScore,
    tailoredResume,
    coverLetter,
    interviewPrep: interviewPrepData.questions,
    companyIntel,
    createdAt: new Date().toISOString(),
  };
}
