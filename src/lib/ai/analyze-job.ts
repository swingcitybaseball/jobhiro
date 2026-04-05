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

// Main orchestrator — runs all 5 analyses in parallel for speed
export async function analyzeJob(
  jobText: string,
  resumeText: string,
  jobUrl?: string
): Promise<AnalysisResult> {
  const id = crypto.randomUUID();

  // Run all AI calls concurrently to minimize total wait time
  const [matchScoreRaw, tailoredResume, coverLetter, interviewPrepRaw, companyIntel] =
    await Promise.all([
      callClaude(buildMatchScorePrompt(jobText, resumeText)),
      callClaude(buildTailorResumePrompt(jobText, resumeText)),
      callClaude(buildCoverLetterPrompt(jobText, resumeText)),
      callClaude(buildInterviewPrepPrompt(jobText, resumeText)),
      callClaude(buildCompanyIntelPrompt(jobText, resumeText)),
    ]);

  // Parse structured JSON outputs
  const matchScore = parseJSON<MatchScoreBreakdown>(matchScoreRaw);
  const interviewPrepData = parseJSON<{ questions: InterviewQuestion[] }>(interviewPrepRaw);

  // Extract basic job metadata from the text (title + company are best-effort)
  const titleMatch = jobText.match(/(?:position|role|title|job)[:]\s*(.+)/i);
  const companyMatch = jobText.match(/(?:company|at|employer)[:]\s*(.+)/i);

  return {
    id,
    jobData: {
      title: titleMatch?.[1]?.trim() ?? "Position",
      company: companyMatch?.[1]?.trim() ?? "Company",
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
