// Cover letter prompt — writes a specific, compelling letter for this job + company
export function buildCoverLetterPrompt(jobText: string, resumeText: string): string {
  return `You are an expert cover letter writer. Write a compelling, personalized cover letter for this specific job application.

JOB POSTING:
<job>
${jobText}
</job>

CANDIDATE'S RESUME:
<resume>
${resumeText}
</resume>

REQUIREMENTS:
- Open with a strong hook that shows you understand what THIS company/role needs — not a generic "I am applying for..."
- Reference the specific company by name and show you understand what they do and what they value
- Connect 2-3 specific experiences from the resume directly to the job's key requirements
- Show genuine enthusiasm for this role — explain WHY this specific job + company, not just any job
- Use confident, active voice — no begging, no "I hope to", no filler phrases
- Close with a clear, confident call to action
- Length: 3-4 focused paragraphs. Not a wall of text. Not too short.
- Tone: Professional but human. Not corporate-stiff, not casual.
- Use the candidate's real name from the resume for the signature

CRITICAL: This letter must feel like it was written specifically for this company and this role. Any hiring manager should feel like this candidate really understands their needs. Generic cover letters are ignored.

CRITICAL FORMATTING RULE: Do NOT include any header, title, contact information, name, address, email, phone number, or markdown formatting at the top of the cover letter. No "# Cover Letter" heading. No "---" dividers. No contact block. Start your response with the first sentence of the opening paragraph — nothing before it. The candidate's contact info will be added separately by the system. Your output is ONLY the letter body and sign-off.`;
}
