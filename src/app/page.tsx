import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { JobInputForm } from "@/components/job-input-form";
import { NavAuth } from "@/components/nav-auth";

export default async function HomePage() {
  const { userId } = await auth();
  const isSignedIn = !!userId;

  return (
    <main className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-gray-100 px-6 py-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <span className="text-lg font-bold text-gray-900">JobPilot</span>
          <div className="flex items-center gap-3">
            <Link href="/pricing" className="text-sm text-gray-500 hover:text-gray-900">
              Pricing
            </Link>
            <NavAuth isSignedIn={isSignedIn} />
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-16">
        {/* Hero */}
        <div className="text-center mb-12 space-y-4">
          <h1 className="text-4xl font-bold text-gray-900 leading-tight">
            Land the job you actually want.
          </h1>
          <p className="text-lg text-gray-500 leading-relaxed">
            Paste a job posting and your resume. Get a tailored resume, cover letter,
            interview prep kit, and company intel — all in one shot.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            {["Match Score", "Tailored Resume", "Cover Letter", "Interview Prep", "Company Intel"].map((item) => (
              <span key={item} className="text-xs font-medium px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full">
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
          <JobInputForm />
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          1 free analysis, no sign-up required.{" "}
          <Link href="/pricing" className="underline hover:text-gray-600">
            See plans →
          </Link>
        </p>
      </div>
    </main>
  );
}
