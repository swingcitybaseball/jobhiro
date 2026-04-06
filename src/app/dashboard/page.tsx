import { auth } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { redirect } from "next/navigation";
import { supabase } from "@/lib/db/supabase";
import { getUserSubscription, getMonthlyAnalysisCount } from "@/lib/usage";
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
  if (n >= 85) return { bg: "#d0fac0", color: "#3e6135" };
  if (n >= 70) return { bg: "#e8e8e4", color: "#303330" };
  if (n >= 55) return { bg: "#fcc3ce", color: "#643c45" };
  return { bg: "#fa7150", color: "#671200" };
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

  const [analysesResult, subscription, monthlyCount] = await Promise.all([
    supabase
      .from("analyses")
      .select("id, job_title, job_company, created_at, result_json")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50),
    getUserSubscription(userId),
    getMonthlyAnalysisCount(userId),
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
    <main className="min-h-screen" style={{ backgroundColor: "#faf9f6", color: "#303330" }}>
      <SubscriptionVerifier />

      {/* Nav */}
      <nav
        className="sticky top-0 z-10 px-6 py-4"
        style={{ backgroundColor: "rgba(250,249,246,0.92)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(177,178,175,0.3)" }}
      >
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Link
            href="/"
            className="text-xl font-bold text-on-surface"
            style={{ fontFamily: "var(--font-noto-serif), Georgia, serif" }}
          >
            JobHiro
          </Link>
          <span style={{ color: "#b1b2af" }}>|</span>
          <span className="text-sm text-on-surface-variant font-medium">Dashboard</span>
          <div className="ml-auto flex items-center gap-3">
            <Link href="/" className="text-sm text-on-surface-variant hover:text-on-surface transition-colors">
              New Analysis
            </Link>
            <UserButton />
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">
        {/* Success banner */}
        {justSubscribed && (
          <div
            className="p-4 text-sm font-medium"
            style={{ backgroundColor: "#d0fac0", color: "#2c4e24", borderRadius: "1rem" }}
          >
            You&apos;re now on {planLabel}! Enjoy unlimited analyses.
          </div>
        )}

        {/* Plan status card */}
        <div
          className="bg-surface-container-lowest p-6 flex items-center justify-between gap-4"
          style={{ borderRadius: "1.5rem", boxShadow: "0px 4px 16px rgba(48, 51, 48, 0.05)" }}
        >
          <div>
            <p className="text-sm text-on-surface-variant">Current plan</p>
            <div className="flex items-center gap-2 mt-1">
              <span
                className="text-2xl font-bold text-on-surface"
                style={{ fontFamily: "var(--font-noto-serif), Georgia, serif" }}
              >
                {planLabel}
              </span>
              {isPaid && (
                <span
                  className="text-xs px-2 py-0.5 font-medium"
                  style={{ backgroundColor: "#d0fac0", color: "#2c4e24", borderRadius: "9999px" }}
                >
                  Active
                </span>
              )}
            </div>
            {!isPaid && (
              <p className="text-sm text-on-surface-variant mt-1">
                You have {(analyses?.length ?? 0) >= 1 ? "0" : "1"} free analysis remaining.
              </p>
            )}
            {plan === "pro" && (
              <p className="text-sm text-on-surface-variant mt-1">
                {monthlyCount} of 30 analyses used this month
                {monthlyCount >= 25 && monthlyCount < 30 && (
                  <span className="ml-1 font-medium" style={{ color: "#943219" }}> — running low</span>
                )}
                {monthlyCount >= 30 && (
                  <span className="ml-1 font-medium text-error"> — limit reached</span>
                )}
              </p>
            )}
            {plan === "premium" && (
              <p className="text-sm text-on-surface-variant mt-1">Unlimited analyses</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            {!isPaid ? (
              <Link
                href="/pricing"
                className="px-5 py-2.5 text-on-primary text-sm font-semibold transition-all hover:scale-95"
                style={{ borderRadius: "9999px", background: "linear-gradient(135deg, #a43e24, #ffac98)" }}
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
          <h2
            className="text-xl font-bold text-on-surface mb-4"
            style={{ fontFamily: "var(--font-noto-serif), Georgia, serif" }}
          >
            Analysis History
            {isPaid && analyses?.length ? (
              <span className="ml-2 text-sm font-normal text-on-surface-variant">({analyses.length})</span>
            ) : null}
          </h2>

          {/* Free users: upgrade prompt */}
          {!isPaid && (
            <div
              className="bg-surface-container-lowest p-8 text-center space-y-3"
              style={{ borderRadius: "1.5rem", boxShadow: "0px 4px 16px rgba(48, 51, 48, 0.05)" }}
            >
              <p
                className="font-bold text-on-surface"
                style={{ fontFamily: "var(--font-noto-serif), Georgia, serif" }}
              >
                Save and revisit every analysis
              </p>
              <p className="text-sm text-on-surface-variant max-w-sm mx-auto">
                Pro and Premium plans save your full analysis history — resume, cover letter, interview prep, and company intel — so you can come back any time.
              </p>
              {analyses?.length ? (
                <p className="text-xs text-on-surface-variant">
                  Your 1 free analysis is saved below. Upgrade to save all future ones.
                </p>
              ) : null}
              <Link
                href="/pricing"
                className="inline-block mt-2 px-5 py-2.5 text-on-primary text-sm font-semibold hover:scale-95 transition-transform"
                style={{ borderRadius: "9999px", background: "linear-gradient(135deg, #a43e24, #ffac98)" }}
              >
                Upgrade to Pro →
              </Link>
            </div>
          )}

          {/* Free user saved analysis */}
          {!isPaid && analyses?.length ? (
            <div className="mt-4 space-y-3">
              {(analyses as AnalysisRow[]).map((a) => (
                <AnalysisCard key={a.id} a={a} />
              ))}
            </div>
          ) : null}

          {/* Paid: empty state */}
          {isPaid && !analyses?.length && (
            <div
              className="bg-surface-container-lowest p-12 text-center"
              style={{ borderRadius: "1.5rem", boxShadow: "0px 4px 16px rgba(48, 51, 48, 0.05)" }}
            >
              <p className="text-on-surface-variant mb-4">No analyses yet.</p>
              <Link
                href="/"
                className="px-5 py-2.5 text-on-primary text-sm font-semibold hover:scale-95 transition-transform"
                style={{ borderRadius: "9999px", background: "linear-gradient(135deg, #a43e24, #ffac98)" }}
              >
                Run Your First Analysis
              </Link>
            </div>
          )}

          {/* Paid: analysis list */}
          {isPaid && analyses?.length ? (
            <div className="space-y-3">
              {(analyses as AnalysisRow[]).map((a) => (
                <AnalysisCard key={a.id} a={a} />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}

function AnalysisCard({ a }: { a: AnalysisRow }) {
  const score = a.result_json.matchScore.overall;
  const { bg, color } = scoreColor(score);
  return (
    <Link
      href={`/results/${a.id}`}
      className="block bg-surface-container-lowest p-5 hover:shadow-md transition-all"
      style={{ borderRadius: "1rem", boxShadow: "0px 2px 8px rgba(48, 51, 48, 0.04)" }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-on-surface truncate">
            {a.job_title || "Untitled Position"}
          </p>
          <p className="text-sm text-on-surface-variant mt-0.5">
            {a.job_company || "Unknown Company"} · {formatDate(a.created_at)}
          </p>
        </div>
        <span
          className="shrink-0 text-sm font-bold px-3 py-1"
          style={{ backgroundColor: bg, color, borderRadius: "9999px" }}
        >
          {score}%
        </span>
      </div>
    </Link>
  );
}
