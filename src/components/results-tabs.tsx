"use client";

import * as Tabs from "@radix-ui/react-tabs";
import { MatchScore } from "./match-score";
import { ResumePreview } from "./resume-preview";
import { CoverLetterPreview } from "./cover-letter-preview";
import { InterviewPrep } from "./interview-prep";
import { CompanyIntel } from "./company-intel";
import type { AnalysisResult } from "@/types";
import { cn } from "@/lib/utils";

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
      {/* Tab list */}
      <Tabs.List className="flex gap-1 border-b border-gray-200 mb-6 overflow-x-auto">
        {tabs.map((tab) => (
          <Tabs.Trigger
            key={tab.id}
            value={tab.id}
            className={cn(
              "px-4 py-2.5 text-sm font-medium whitespace-nowrap rounded-t-lg transition-colors",
              "text-gray-500 hover:text-gray-800",
              "data-[state=active]:text-gray-900 data-[state=active]:border-b-2 data-[state=active]:border-gray-900 data-[state=active]:-mb-px"
            )}
          >
            {tab.label}
          </Tabs.Trigger>
        ))}
      </Tabs.List>

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
