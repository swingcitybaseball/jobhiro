// Match score prompt — returns structured JSON with breakdown scores and analysis
export function buildMatchScorePrompt(jobText: string, resumeText: string): string {
  return `You are a senior technical recruiter and ATS expert. Analyze how well this candidate matches this specific job posting.

JOB POSTING:
<job>
${jobText}
</job>

CANDIDATE RESUME:
<resume>
${resumeText}
</resume>

Score the candidate on these 4 dimensions (each 0-100):
1. skills — how well their technical/professional skills match the job requirements
2. experience — how relevant their work history and seniority level is
3. education — how well their education/certifications align
4. keywords — how many of the job's key terms and phrases appear in their background

Then calculate an overall score (weighted: skills 40%, experience 35%, education 10%, keywords 15%).

Be honest and specific. A 90+ score means they're an exceptional fit. A 50 means average. Don't inflate scores.

Respond with ONLY valid JSON in this exact format — no markdown, no extra text:
{
  "skills": <number 0-100>,
  "experience": <number 0-100>,
  "education": <number 0-100>,
  "keywords": <number 0-100>,
  "overall": <number 0-100>,
  "summary": "<2-3 sentences explaining the overall match — be specific about WHY>",
  "strengths": ["<specific strength 1>", "<specific strength 2>", "<specific strength 3>"],
  "gaps": ["<specific gap 1>", "<specific gap 2>", "<specific gap 3>"]
}`;
}
