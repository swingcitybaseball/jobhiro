"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Copy, Check } from "lucide-react";
import type { InterviewQuestion } from "@/types";

interface Props {
  questions: InterviewQuestion[];
}

const categoryColors: Record<string, string> = {
  Behavioral: "bg-purple-100 text-purple-700",
  Technical: "bg-blue-100 text-blue-700",
  Situational: "bg-amber-100 text-amber-700",
  Culture: "bg-green-100 text-green-700",
};

function QuestionCard({ q, index }: { q: InterviewQuestion; index: number }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  async function copyAnswer() {
    await navigator.clipboard.writeText(q.answer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const badgeClass = categoryColors[q.category] ?? "bg-gray-100 text-gray-700";

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start justify-between p-4 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-start gap-3 flex-1">
          <span className="text-sm font-bold text-gray-400 mt-0.5 w-6 shrink-0">{index + 1}.</span>
          <div className="space-y-1">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${badgeClass}`}>
              {q.category}
            </span>
            <p className="text-gray-800 font-medium">{q.question}</p>
          </div>
        </div>
        <span className="ml-4 shrink-0 text-gray-400 mt-1">
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </span>
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-3">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-semibold text-gray-600">Suggested Answer</h4>
              <button
                onClick={copyAnswer}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800 transition-colors"
              >
                {copied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <p className="text-gray-700 text-sm leading-relaxed bg-gray-50 p-3 rounded-lg">{q.answer}</p>
          </div>
          <div className="flex gap-2 items-start">
            <span className="text-amber-500 text-sm mt-0.5">💡</span>
            <p className="text-sm text-gray-600 italic">{q.tip}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export function InterviewPrep({ questions }: Props) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
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
