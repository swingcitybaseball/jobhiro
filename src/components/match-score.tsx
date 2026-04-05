"use client";

import type { MatchScoreBreakdown } from "@/types";

interface Props {
  score: MatchScoreBreakdown;
}

// Color-coded score label based on value
function scoreLabel(n: number): string {
  if (n >= 85) return "Excellent";
  if (n >= 70) return "Good";
  if (n >= 55) return "Fair";
  return "Low";
}

function scoreColor(n: number): string {
  if (n >= 85) return "text-emerald-600";
  if (n >= 70) return "text-blue-600";
  if (n >= 55) return "text-amber-600";
  return "text-red-600";
}

function barColor(n: number): string {
  if (n >= 85) return "bg-emerald-500";
  if (n >= 70) return "bg-blue-500";
  if (n >= 55) return "bg-amber-500";
  return "bg-red-500";
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">{label}</span>
        <span className={`font-semibold ${scoreColor(value)}`}>{value}</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${barColor(value)}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

export function MatchScore({ score }: Props) {
  return (
    <div className="space-y-6">
      {/* Overall score hero */}
      <div className="flex items-center gap-6 p-6 bg-gray-50 rounded-xl">
        <div className="text-center">
          <div className={`text-6xl font-bold ${scoreColor(score.overall)}`}>
            {score.overall}
          </div>
          <div className="text-sm text-gray-500 mt-1">/ 100</div>
          <div className={`text-sm font-semibold mt-1 ${scoreColor(score.overall)}`}>
            {scoreLabel(score.overall)} Match
          </div>
        </div>
        <div className="flex-1">
          <p className="text-gray-700 leading-relaxed">{score.summary}</p>
        </div>
      </div>

      {/* Category breakdown */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Breakdown</h3>
        <ScoreBar label="Skills Match" value={score.skills} />
        <ScoreBar label="Experience Relevance" value={score.experience} />
        <ScoreBar label="Education Fit" value={score.education} />
        <ScoreBar label="Keyword Alignment" value={score.keywords} />
      </div>

      {/* Strengths & gaps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100">
          <h3 className="text-sm font-semibold text-emerald-700 mb-2">Top Strengths</h3>
          <ul className="space-y-1">
            {score.strengths.map((s, i) => (
              <li key={i} className="text-sm text-emerald-800 flex gap-2">
                <span>✓</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="p-4 bg-amber-50 rounded-lg border border-amber-100">
          <h3 className="text-sm font-semibold text-amber-700 mb-2">Gaps to Address</h3>
          <ul className="space-y-1">
            {score.gaps.map((g, i) => (
              <li key={i} className="text-sm text-amber-800 flex gap-2">
                <span>!</span>
                <span>{g}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
