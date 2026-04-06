"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Copy, Check } from "lucide-react";
import type { InterviewQuestion } from "@/types";

interface Props {
  questions: InterviewQuestion[];
}

// Warm palette badges — no hard blue/purple, stay in the design system
const categoryStyle: Record<string, React.CSSProperties> = {
  Behavioral:  { backgroundColor: "#d0fac0", color: "#2c4e24" },   // secondary-container
  Technical:   { backgroundColor: "#e1e3df", color: "#5d605c" },   // surface-variant
  Situational: { backgroundColor: "#ffac98", color: "#751c05" },   // primary-container
  Culture:     { backgroundColor: "#fcc3ce", color: "#643c45" },   // tertiary-container
};

function QuestionCard({ q, index }: { q: InterviewQuestion; index: number }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  async function copyAnswer() {
    await navigator.clipboard.writeText(q.answer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const badgeStyle = categoryStyle[q.category] ?? { backgroundColor: "#eeeeea", color: "#5d605c" };

  return (
    <div
      className="overflow-hidden transition-shadow hover:shadow-md"
      style={{
        borderRadius: "1rem",
        backgroundColor: "#ffffff",
        boxShadow: "0px 2px 8px rgba(48,51,48,0.04)",
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start justify-between p-4 text-left transition-colors"
        style={{ backgroundColor: open ? "#faf9f6" : "#ffffff" }}
      >
        <div className="flex items-start gap-3 flex-1">
          <span
            className="text-sm font-bold mt-0.5 w-6 shrink-0"
            style={{ color: "#b1b2af" }}
          >
            {index + 1}.
          </span>
          <div className="space-y-1.5">
            <span
              className="text-xs font-semibold px-2.5 py-0.5 inline-block"
              style={{ borderRadius: "9999px", ...badgeStyle }}
            >
              {q.category}
            </span>
            <p className="font-medium" style={{ color: "#303330" }}>{q.question}</p>
          </div>
        </div>
        <span className="ml-4 shrink-0 mt-1" style={{ color: "#b1b2af" }}>
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </span>
      </button>

      {open && (
        <div
          className="px-4 pb-4 pt-3 space-y-3"
          style={{ borderTop: "1px solid rgba(177,178,175,0.35)" }}
        >
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-semibold" style={{ color: "#5d605c" }}>Suggested Answer</h4>
              <button
                onClick={copyAnswer}
                className="flex items-center gap-1 text-xs transition-colors hover:scale-95"
                style={{ color: "#797b78" }}
              >
                {copied ? <Check size={12} style={{ color: "#44683b" }} /> : <Copy size={12} />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <p
              className="text-sm leading-relaxed p-3"
              style={{
                color: "#5d605c",
                backgroundColor: "#f4f4f0",
                borderRadius: "0.75rem",
              }}
            >
              {q.answer}
            </p>
          </div>
          <div className="flex gap-2 items-start">
            <span className="text-sm mt-0.5">💡</span>
            <p className="text-sm italic" style={{ color: "#797b78" }}>{q.tip}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export function InterviewPrep({ questions }: Props) {
  return (
    <div className="space-y-4">
      <p className="text-sm" style={{ color: "#5d605c" }}>
        {questions.length} questions tailored to this role and your background. Click any question to see your personalized answer.
      </p>
      <div className="space-y-2">
        {questions.map((q, i) => (
          <QuestionCard key={i} q={q} index={i} />
        ))}
      </div>
    </div>
  );
}
