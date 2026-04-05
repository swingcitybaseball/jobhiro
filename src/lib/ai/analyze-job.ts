import { anthropic, SONNET_MODEL, HAIKU_MODEL } from "./client";
import { buildMatchScorePrompt } from "./prompts/match-score";
import { buildTailorResumePrompt } from "./prompts/tailor-resume";
import { buildCoverLetterPrompt } from "./prompts/cover-letter";
import { buildInterviewPrepPrompt } from "./prompts/interview-prep";
import { buildCompanyIntelPrompt } from "./prompts/company-intel";
import type { AnalysisResult, MatchScoreBreakdown, InterviewQuestion } from "@/types";

// Calls Claude with a specific model — defaults to Sonnet
async function callClaude(prompt: string, model: string = SONNET_MODEL): Promise<string> {
  const response = await anthropic.messages.create({
    model,
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

// Main orchestrator — runs all 6 calls in parallel for speed.
// Model assignment:
//   Haiku  — match score (scoring/categorizing), company intel (research synthesis), job meta (extraction)
//   Sonnet — tailored resume, cover letter, interview prep (writing quality matters most)
export async function analyzeJob(
  jobText: string,
  resumeText: string,
  jobUrl?: string
): Promise<AnalysisResult> {
  const id = crypto.randomUUID();

  const [matchScoreRaw, tailoredResume, coverLetter, interviewPrepRaw, companyIntel, jobMetaRaw] =
    await Promise.all([
      callClaude(buildMatchScorePrompt(jobText, resumeText), HAIKU_MODEL),
      callClaude(buildTailorResumePrompt(jobText, resumeText), SONNET_MODEL),
      callClaude(buildCoverLetterPrompt(jobText, resumeText), SONNET_MODEL),
      callClaude(buildInterviewPrepPrompt(jobText, resumeText), SONNET_MODEL),
      callClaude(buildCompanyIntelPrompt(jobText, resumeText), HAIKU_MODEL),
      callClaude(buildJobMetaPrompt(jobText), HAIKU_MODEL),
    ]);

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
