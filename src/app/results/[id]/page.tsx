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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800"
          >
            Start New Analysis
          </button>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white pb-20">
      {/* Nav */}
      <nav className="border-b border-gray-100 px-6 py-4 sticky top-0 bg-white z-10">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={16} />
            New Analysis
          </button>
          <span className="text-gray-300">|</span>
          <span className="text-lg font-bold text-gray-900">JobPilot</span>
          <div className="ml-auto flex items-center gap-3">
            <span className="text-sm text-gray-500 hidden sm:block">{result.jobData.title}</span>
            {isSignedIn ? (
              <>
                <a href="/dashboard" className="text-sm text-gray-500 hover:text-gray-900">Dashboard</a>
                <UserButton />
              </>
            ) : (
              <SignInButton mode="modal">
                <button className="text-sm px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Sign in
                </button>
              </SignInButton>
            )}
          </div>
        </div>
      </nav>

      {/* Match score headline */}
      <div className="border-b border-gray-100 bg-gray-50 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-gray-900">{result.matchScore.overall}</span>
            <span className="text-gray-400 text-sm">/ 100 match</span>
          </div>
          <span className="text-gray-300">—</span>
          <p className="text-sm text-gray-600 flex-1 line-clamp-1">{result.matchScore.summary}</p>
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
