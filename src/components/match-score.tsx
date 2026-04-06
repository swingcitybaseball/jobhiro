"use client";

import type { MatchScoreBreakdown } from "@/types";

interface Props {
  score: MatchScoreBreakdown;
}

function scoreLabel(n: number): string {
  if (n >= 85) return "Excellent";
  if (n >= 70) return "Good";
  if (n >= 55) return "Fair";
  return "Low";
}

// Returns inline style color for score text
function scoreStyle(n: number): React.CSSProperties {
  if (n >= 70) return { color: "#44683b" };     // secondary — green/good
  if (n >= 55) return { color: "#5d605c" };     // on-surface-variant — neutral
  return { color: "#aa371c" };                  // error — low
}

// Returns inline style for progress bar fill
function barStyle(n: number): React.CSSProperties {
  if (n >= 70) return { backgroundColor: "#44683b" };
  if (n >= 55) return { backgroundColor: "#797b78" };
  return { backgroundColor: "#aa371c" };
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span style={{ color: "#5d605c" }}>{label}</span>
        <span className="font-semibold" style={scoreStyle(value)}>{value}</span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: "#eeeeea" }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${value}%`, ...barStyle(value) }}
        />
      </div>
    </div>
  );
}

export function MatchScore({ score }: Props) {
  return (
    <div className="space-y-6">
      {/* Overall score hero */}
      <div
        className="flex items-center gap-6 p-6"
        style={{
          backgroundColor: "#f4f4f0",
          borderRadius: "1.5rem",
        }}
      >
        <div className="text-center shrink-0">
          <div
            className="text-6xl font-bold leading-none"
            style={{
              fontFamily: "var(--font-noto-serif), Georgia, serif",
              ...scoreStyle(score.overall),
            }}
          >
            {score.overall}
          </div>
          <div className="text-xs mt-1" style={{ color: "#797b78" }}>/ 100</div>
          <div className="text-sm font-semibold mt-2" style={scoreStyle(score.overall)}>
            {scoreLabel(score.overall)} Match
          </div>
        </div>
        <div className="flex-1">
          <p className="leading-relaxed" style={{ color: "#303330" }}>{score.summary}</p>
        </div>
      </div>

      {/* Category breakdown */}
      <div className="space-y-4">
        <h3
          className="text-xs font-semibold uppercase tracking-wider"
          style={{ color: "#797b78" }}
        >
          Breakdown
        </h3>
        <ScoreBar label="Skills Match" value={score.skills} />
        <ScoreBar label="Experience Relevance" value={score.experience} />
        <ScoreBar label="Education Fit" value={score.education} />
        <ScoreBar label="Keyword Alignment" value={score.keywords} />
      </div>

      {/* Strengths & gaps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Strengths — secondary-container */}
        <div className="p-5" style={{ backgroundColor: "#d0fac0", borderRadius: "1rem" }}>
          <h3 className="text-sm font-bold mb-3" style={{ color: "#2c4e24" }}>Top Strengths</h3>
          <ul className="space-y-2">
            {score.strengths.map((s, i) => (
              <li key={i} className="text-sm flex gap-2" style={{ color: "#3e6135" }}>
                <span className="shrink-0 font-bold">✓</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
        {/* Gaps — primary-container */}
        <div className="p-5" style={{ backgroundColor: "#ffac98", borderRadius: "1rem" }}>
          <h3 className="text-sm font-bold mb-3" style={{ color: "#751c05" }}>Gaps to Address</h3>
          <ul className="space-y-2">
            {score.gaps.map((g, i) => (
              <li key={i} className="text-sm flex gap-2" style={{ color: "#81240d" }}>
                <span className="shrink-0 font-bold">!</span>
                <span>{g}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
