import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { analyzeJob } from "@/lib/ai/analyze-job";
import { supabase } from "@/lib/db/supabase";
import {
  getUserSubscription,
  getAuthenticatedAnalysisCount,
} from "@/lib/usage";
import type { AnalyzeRequest } from "@/types";

// Cookie name used to track anonymous usage
const USAGE_COOKIE = "jp_usage";

export async function POST(req: NextRequest) {
  try {
    const body: AnalyzeRequest = await req.json();
    const { jobText, resumeText, jobUrl } = body;

    if (!jobText || jobText.trim().length < 50) {
      return NextResponse.json({ error: "Job description is too short or missing" }, { status: 400 });
    }
    if (!resumeText || resumeText.trim().length < 50) {
      return NextResponse.json({ error: "Resume text is too short or missing" }, { status: 400 });
    }

    // ── Step 1: Identify caller ───────────────────────────────────────────
    const { userId } = await auth();
    let showUpgradePrompt = false;

    // ── Step 2: Enforce free tier gate BEFORE running AI ─────────────────
    if (!userId) {
      // Anonymous user — gate by cookie (httpOnly, 1-year TTL)
      const usageCookie = req.cookies.get(USAGE_COOKIE);
      if (usageCookie?.value === "1") {
        return NextResponse.json(
          {
            error:
              "You've used your free analysis. Sign up for a free account or upgrade to Pro for unlimited.",
            code: "FREE_LIMIT_REACHED",
          },
          { status: 403 }
        );
      }
      showUpgradePrompt = true; // this will be their last free one
    } else {
      // Authenticated user — check subscription
      const sub = await getUserSubscription(userId);
      const plan = sub?.plan ?? "free";
      const isPaid = (plan === "pro" || plan === "premium") && sub?.status === "active";

      if (!isPaid) {
        // Free authenticated users get 1 analysis total
        const count = await getAuthenticatedAnalysisCount(userId);
        if (count >= 1) {
          return NextResponse.json(
            {
              error: "Upgrade to Pro for unlimited analyses.",
              code: "FREE_LIMIT_REACHED",
            },
            { status: 429 }
          );
        }
        showUpgradePrompt = true;
      }
    }

    // ── Step 3: Run analysis ──────────────────────────────────────────────
    const result = await analyzeJob(jobText, resumeText, jobUrl);

    // ── Step 4: Record usage AFTER success ────────────────────────────────
    if (userId) {
      // Save full result to Supabase for dashboard history
      supabase
        .from("analyses")
        .insert({
          id: result.id,
          user_id: userId,
          job_title: result.jobData.title,
          job_company: result.jobData.company,
          job_url: jobUrl ?? null,
          result_json: result,
        })
        .then(({ error }) => {
          if (error) console.error("Failed to save analysis:", error.message);
        });
    }

    // Build response — set usage cookie for anonymous users so the gate holds on refresh
    const response = NextResponse.json({ ...result, showUpgradePrompt });

    if (!userId) {
      response.cookies.set(USAGE_COOKIE, "1", {
        httpOnly: true,   // JS can't read or clear it from the browser
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 365, // 1 year
      });
    }

    return response;
  } catch (err) {
    console.error("Analysis error:", err);
    return NextResponse.json({ error: "Analysis failed. Please try again." }, { status: 500 });
  }
}

// Allow up to 5 minutes — all 5 AI calls run in parallel
export const maxDuration = 300;
