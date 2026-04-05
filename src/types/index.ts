// Core data models for JobHiro

export interface JobData {
  title: string;
  company: string;
  location?: string;
  description: string;
  requirements?: string;
  rawText: string; // full scraped or pasted text
}

export interface MatchScoreBreakdown {
  skills: number;       // 0-100
  experience: number;   // 0-100
  education: number;    // 0-100
  keywords: number;     // 0-100
  overall: number;      // 0-100
  summary: string;      // 2-3 sentence plain-language summary
  strengths: string[];  // top 3 matching strengths
  gaps: string[];       // top 3 gaps to address
}

export interface InterviewQuestion {
  question: string;
  category: string; // e.g. "Behavioral", "Technical", "Situational"
  answer: string;   // tailored answer using user's background
  tip: string;      // brief delivery tip
}

export interface AnalysisResult {
  id: string;
  jobData: JobData;
  matchScore: MatchScoreBreakdown;
  tailoredResume: string;   // full resume text, ATS-optimized markdown
  coverLetter: string;      // full cover letter text
  interviewPrep: InterviewQuestion[];
  companyIntel: string;     // company intel brief in markdown
  createdAt: string;
  showUpgradePrompt?: boolean; // true when the user has used their last free analysis
}

export type SubscriptionPlan = "free" | "pro" | "premium";

export interface AnalyzeRequest {
  jobText: string;       // raw job description or scraped content
  resumeText: string;    // extracted or pasted resume text
  jobUrl?: string;       // optional — for display purposes
}
