// Company intel prompt — generates a research brief on the company from the job posting
export function buildCompanyIntelPrompt(jobText: string, resumeText: string): string {
  return `You are a research analyst who helps job seekers understand the companies they're applying to. Based on the job posting (and any company signals within it), create a concise company intel brief.

JOB POSTING:
<job>
${jobText}
</job>

CANDIDATE'S RESUME (for context on what they'd care about):
<resume>
${resumeText}
</resume>

Based on everything you can infer from the job posting — language used, what they emphasize, how they describe the role, their requirements and nice-to-haves — create an intel brief covering:

## Company Profile
What this company does, their likely size/stage, and market position (infer from job posting signals).

## What They Actually Value
Based on how they wrote this job posting: what do they really care about? What signals show up in their language, requirements, and how they describe success?

## Culture Signals
What does the tone and content of this posting tell us about their culture? Fast-paced? Process-driven? Collaborative? What do they emphasize beyond the job itself?

## Red Flags & Green Flags
Honest read: What looks good about this opportunity? What might be worth clarifying in the interview?

## Strategic Tips for This Application
3-4 specific things this candidate should emphasize or research before their interview, based on what this company seems to value.

Write in a direct, useful format — this is intel for the candidate to act on, not a bland summary. Use the company name from the posting if visible.

Format in clean Markdown. Start directly with the brief.`;
}
