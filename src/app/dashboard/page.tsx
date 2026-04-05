import { auth } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { redirect } from "next/navigation";
import { supabase } from "@/lib/db/supabase";
import { getUserSubscription } from "@/lib/usage";
import { ManageSubscriptionButton } from "@/components/manage-subscription-button";
import { SubscriptionVerifier } from "@/components/subscription-verifier";

interface AnalysisRow {
  id: string;
  job_title: string;
  job_company: string;
  created_at: string;
  result_json: { matchScore: { overall: number } };
}

function scoreColor(n: number) {
  if (n >= 85) return "text-emerald-600 bg-emerald-50";
  if (n >= 70) return "text-blue-600 bg-blue-50";
  if (n >= 55) return "text-amber-600 bg-amber-50";
  return "text-red-600 bg-red-50";
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const params = await searchParams;
  const justSubscribed = params.checkout === "success";

  // Load analyses and subscription in parallel
  const [analysesResult, subscription] = await Promise.all([
    supabase
      .from("analyses")
      .select("id, job_title, job_company, created_at, result_json")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50),
    getUserSubscription(userId),
  ]);

  console.log("[dashboard] userId:", userId);
  console.log("[dashboard] analyses count:", analysesResult.data?.length ?? 0);
  if (analysesResult.error) {
    console.error("[dashboard] Supabase query error:", analysesResult.error.message, analysesResult.error.details);
  }

  const analyses = analysesResult.data;

  const plan = subscription?.plan ?? "free";
  const isPaid = (plan === "pro" || plan === "premium") && subscription?.status === "active";
  const planLabel = plan.charAt(0).toUpperCase() + plan.slice(1);

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Silently syncs Stripe → Supabase if webhook hasn't fired yet */}
      <SubscriptionVerifier />
      {/* Nav */}
      <nav className="bg-white border-b border-gray-100 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Link href="/" className="text-lg font-bold text-gray-900">JobPilot</Link>
          <span className="text-gray-300">|</span>
          <span className="text-sm text-gray-500 font-medium">Dashboard</span>
          <div className="ml-auto flex items-center gap-3">
            <Link
              href="/"
              className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
            >
              New Analysis
            </Link>
            <UserButton />
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">
        {/* Success banner after checkout */}
        {justSubscribed && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-800 font-medium">
            🎉 You&apos;re now on {planLabel}! Enjoy unlimited analyses.
          </div>
        )}

        {/* Plan status card */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-gray-500">Current plan</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xl font-bold text-gray-900">{planLabel}</span>
              {isPaid && (
                <span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-medium">
                  Active
                </span>
              )}
            </div>
            {!isPaid && (
              <p className="text-sm text-gray-500 mt-1">
                You have {(analyses?.length ?? 0) >= 1 ? "0" : "1"} free analysis remaining.
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            {!isPaid ? (
              <Link
                href="/pricing"
                className="px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-colors"
              >
                Upgrade to Pro →
              </Link>
            ) : (
              <ManageSubscriptionButton />
            )}
          </div>
        </div>

        {/* Analyses list */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Analysis History
            {isPaid && analyses?.length ? (
              <span className="ml-2 text-sm font-normal text-gray-400">
                ({analyses.length})
              </span>
            ) : null}
          </h2>

          {/* Free users: upgrade prompt */}
          {!isPaid && (
            <div className="bg-white border border-gray-200 rounded-xl p-8 text-center space-y-3">
              <p className="text-gray-900 font-semibold">Save and revisit every analysis</p>
              <p className="text-sm text-gray-500 max-w-sm mx-auto">
                Pro and Premium plans save your full analysis history — resume, cover letter, interview prep, and company intel — so you can come back any time.
              </p>
              {analyses?.length ? (
                <p className="text-xs text-gray-400">
                  Your 1 free analysis is saved below. Upgrade to save all future ones.
                </p>
              ) : null}
              <Link
                href="/pricing"
                className="inline-block mt-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-colors"
              >
                Upgrade to Pro →
              </Link>
            </div>
          )}

          {/* Free users: show their 1 saved analysis below the upgrade prompt */}
          {!isPaid && analyses?.length ? (
            <div className="mt-4 space-y-3">
              {(analyses as AnalysisRow[]).map((a) => (
                <Link
                  key={a.id}
                  href={`/results/${a.id}`}
                  className="block bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-400 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">
                        {a.job_title || "Untitled Position"}
                      </p>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {a.job_company || "Unknown Company"} · {formatDate(a.created_at)}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 text-sm font-bold px-3 py-1 rounded-full ${scoreColor(
                        a.result_json.matchScore.overall
                      )}`}
                    >
                      {a.result_json.matchScore.overall}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : null}

          {/* Paid users: full history or empty state */}
          {isPaid && !analyses?.length && (
            <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
              <p className="text-gray-500 mb-4">No analyses yet.</p>
              <Link
                href="/"
                className="px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-colors"
              >
                Run Your First Analysis
              </Link>
            </div>
          )}

          {isPaid && analyses?.length ? (
            <div className="space-y-3">
              {(analyses as AnalysisRow[]).map((a) => (
                <Link
                  key={a.id}
                  href={`/results/${a.id}`}
                  className="block bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-400 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">
                        {a.job_title || "Untitled Position"}
                      </p>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {a.job_company || "Unknown Company"} · {formatDate(a.created_at)}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 text-sm font-bold px-3 py-1 rounded-full ${scoreColor(
                        a.result_json.matchScore.overall
                      )}`}
                    >
                      {a.result_json.matchScore.overall}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}
