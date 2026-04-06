"use client";

import * as Tabs from "@radix-ui/react-tabs";
import { MatchScore } from "./match-score";
import { ResumePreview } from "./resume-preview";
import { CoverLetterPreview } from "./cover-letter-preview";
import { InterviewPrep } from "./interview-prep";
import { CompanyIntel } from "./company-intel";
import type { AnalysisResult } from "@/types";

interface Props {
  result: AnalysisResult;
}

const tabs = [
  { id: "score", label: "Match Score" },
  { id: "resume", label: "Resume" },
  { id: "cover-letter", label: "Cover Letter" },
  { id: "interview", label: "Interview Prep" },
  { id: "intel", label: "Company Intel" },
] as const;

export function ResultsTabs({ result }: Props) {
  return (
    <Tabs.Root defaultValue="score" className="w-full">
      {/* Tab list — no hard border, primary color for active indicator */}
      <Tabs.List
        className="flex gap-1 overflow-x-auto mb-8 pb-px"
        style={{ borderBottom: "1px solid rgba(177,178,175,0.35)" }}
      >
        {tabs.map((tab) => (
          <Tabs.Trigger
            key={tab.id}
            value={tab.id}
            className="px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors outline-none -mb-px"
            style={{
              color: "#5d605c",
              borderBottom: "2px solid transparent",
            }}
            // Radix adds data-[state=active] — we handle it via a CSS class trick with inline style override
            // because Tailwind v4 data-* selectors aren't reliable without config
            onFocus={() => {}}
            data-tab-trigger=""
          >
            {tab.label}
          </Tabs.Trigger>
        ))}
      </Tabs.List>

      <style>{`
        [data-tab-trigger][data-state="active"] {
          color: #a43e24 !important;
          border-bottom-color: #a43e24 !important;
          font-weight: 600;
        }
        [data-tab-trigger][data-state="inactive"]:hover {
          color: #303330 !important;
        }
      `}</style>

      <Tabs.Content value="score">
        <MatchScore score={result.matchScore} />
      </Tabs.Content>

      <Tabs.Content value="resume">
        <ResumePreview content={result.tailoredResume} />
      </Tabs.Content>

      <Tabs.Content value="cover-letter">
        <CoverLetterPreview content={result.coverLetter} />
      </Tabs.Content>

      <Tabs.Content value="interview">
        <InterviewPrep questions={result.interviewPrep} />
      </Tabs.Content>

      <Tabs.Content value="intel">
        <CompanyIntel content={result.companyIntel} />
      </Tabs.Content>
    </Tabs.Root>
  );
}
