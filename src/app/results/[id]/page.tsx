"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { UserButton, SignInButton, useUser } from "@clerk/nextjs";

import { ResultsTabs } from "@/components/results-tabs";
import { UpgradeBanner } from "@/components/upgrade-banner";
import type { AnalysisResult } from "@/types";

export default function ResultsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { isSignedIn } = useUser() as { isSignedIn: boolean };
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadResult() {
      // 1. Try sessionStorage first (fresh analysis from this browser session)
      const stored = sessionStorage.getItem(`analysis-${id}`);
      if (stored) {
        try {
          const parsed: AnalysisResult = JSON.parse(stored);
          setResult(parsed);
          setShowUpgrade(parsed.showUpgradePrompt ?? false);
          return;
        } catch {
          // Fall through to Supabase fetch
        }
      }

      // 2. Fallback: fetch from Supabase (dashboard navigation, different device, etc.)
      try {
        const res = await fetch(`/api/results/${id}`);
        if (!res.ok) {
          setError("Result not found. Please run a new analysis.");
          return;
        }
        const data: AnalysisResult = await res.json();
        setResult(data);
      } catch {
        setError("Failed to load result. Please try again.");
      }
    }

    loadResult();
  }, [id]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#faf9f6" }}>
        <div className="text-center space-y-4">
          <p style={{ color: "#5d605c" }}>{error}</p>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-2.5 text-sm font-semibold text-on-primary hover:scale-95 transition-transform"
            style={{ borderRadius: "9999px", background: "linear-gradient(135deg, #a43e24, #ffac98)" }}
          >
            Start New Analysis
          </button>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#faf9f6" }}>
        <Loader2 size={32} className="animate-spin" style={{ color: "#b1b2af" }} />
      </div>
    );
  }

  return (
    <main className="min-h-screen pb-20" style={{ backgroundColor: "#faf9f6", color: "#303330" }}>
      {/* Nav — glassmorphism sticky bar matching the site-wide style */}
      <nav
        className="sticky top-0 z-50 px-6 py-3"
        style={{
          background: "rgba(250, 249, 246, 0.88)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          boxShadow: "0 1px 0 rgba(177,178,175,0.35)",
        }}
      >
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-primary"
            style={{ color: "#5d605c" }}
          >
            <ArrowLeft size={15} />
            New Analysis
          </button>
          <span style={{ color: "#b1b2af" }}>|</span>
          <span
            className="text-xl font-bold"
            style={{ fontFamily: "var(--font-noto-serif), Georgia, serif", color: "#303330" }}
          >
            JobHiro
          </span>
          <div className="ml-auto flex items-center gap-3">
            <span className="text-sm hidden sm:block" style={{ color: "#5d605c" }}>
              {result.jobData.title}
            </span>
            {isSignedIn ? (
              <>
                <a
                  href="/dashboard"
                  className="text-sm font-medium transition-colors hover:text-primary"
                  style={{ color: "#5d605c" }}
                >
                  Dashboard
                </a>
                <UserButton />
              </>
            ) : (
              <SignInButton mode="modal">
                <button
                  className="text-sm px-5 py-1.5 font-semibold text-on-primary hover:scale-95 transition-transform"
                  style={{ borderRadius: "9999px", background: "linear-gradient(135deg, #a43e24, #ffac98)" }}
                >
                  Join
                </button>
              </SignInButton>
            )}
          </div>
        </div>
      </nav>

      {/* Match score headline bar */}
      <div
        className="px-6 py-4"
        style={{ backgroundColor: "#f4f4f0" }}
      >
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <span
            className="text-3xl font-bold"
            style={{
              fontFamily: "var(--font-noto-serif), Georgia, serif",
              color: result.matchScore.overall >= 70 ? "#44683b" : result.matchScore.overall >= 55 ? "#5d605c" : "#aa371c",
            }}
          >
            {result.matchScore.overall}
          </span>
          <span className="text-sm" style={{ color: "#797b78" }}>/ 100</span>
          <span
            className="text-sm font-semibold px-3 py-1"
            style={{
              borderRadius: "9999px",
              backgroundColor: result.matchScore.overall >= 70 ? "#d0fac0" : result.matchScore.overall >= 55 ? "#e1e3df" : "#ffac98",
              color: result.matchScore.overall >= 70 ? "#2c4e24" : result.matchScore.overall >= 55 ? "#5d605c" : "#751c05",
            }}
          >
            {result.matchScore.overall >= 85 ? "Excellent Match" : result.matchScore.overall >= 70 ? "Good Match" : result.matchScore.overall >= 55 ? "Fair Match" : "Low Match"}
          </span>
          <span className="text-sm flex-1 line-clamp-1 hidden sm:block" style={{ color: "#5d605c" }}>
            — {result.matchScore.summary}
          </span>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <ResultsTabs result={result} />
      </div>

      {/* Upgrade banner — sticky at bottom */}
      <UpgradeBanner show={showUpgrade} />
    </main>
  );
}
