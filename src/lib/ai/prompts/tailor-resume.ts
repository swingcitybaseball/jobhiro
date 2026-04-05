// Tailor resume prompt — rewrites the user's resume specifically for this job
export function buildTailorResumePrompt(jobText: string, resumeText: string): string {
  return `You are an expert resume writer and ATS optimization specialist. Rewrite the candidate's resume to be perfectly tailored for this specific job.

JOB POSTING:
<job>
${jobText}
</job>

CANDIDATE'S ORIGINAL RESUME:
<resume>
${resumeText}
</resume>

RULES:
- Use ONLY real experience, skills, and accomplishments from the original resume — never invent anything
- Reorder and reframe bullet points to emphasize what THIS job cares about most
- Mirror the language and keywords from the job posting naturally (ATS optimization)
- Quantify achievements wherever the original resume has numbers — use them
- Remove or minimize experience that's irrelevant to this role
- Use strong action verbs that match the industry/role
- Keep the same basic structure: contact info, summary, experience, skills, education
- Write a targeted professional summary at the top that directly addresses this role
- Format in clean Markdown so it renders well

CRITICAL: Every section must connect to what this specific job needs. Generic resumes fail. This one must feel like it was written for THIS job posting.

Output the complete tailored resume in Markdown format. Start directly with the resume content — no intro, no explanation.`;
}
