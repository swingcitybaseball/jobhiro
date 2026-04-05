// Interview prep prompt — generates tailored Q&A based on the specific job + resume
export function buildInterviewPrepPrompt(jobText: string, resumeText: string): string {
  return `You are a senior interview coach who helps candidates prepare for specific roles. Generate a targeted interview prep kit for this candidate applying to this specific job.

JOB POSTING:
<job>
${jobText}
</job>

CANDIDATE'S RESUME:
<resume>
${resumeText}
</resume>

Generate exactly 12 interview questions this candidate is likely to face for THIS specific role. Mix of:
- Behavioral questions (4-5) using their actual experience (STAR format answers)
- Technical/skills questions (3-4) based on the job's specific requirements
- Situational questions (2-3) relevant to the role's challenges
- Culture/motivation questions (1-2) about why THIS company/role

For each question, write a complete tailored answer using the candidate's REAL experience from their resume. Answers should be specific, use real examples, and be 3-6 sentences.

Also include a brief "tip" for each question — delivery advice, what the interviewer is really testing, or how to frame the answer.

Respond with ONLY valid JSON in this exact format — no markdown, no extra text:
{
  "questions": [
    {
      "question": "<the interview question>",
      "category": "<Behavioral | Technical | Situational | Culture>",
      "answer": "<complete tailored answer using candidate's real background>",
      "tip": "<brief coaching tip — what the interviewer wants to hear>"
    }
  ]
}`;
}
