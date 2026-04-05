"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Upload, Link, FileText, X } from "lucide-react";
import type { AnalysisResult } from "@/types";

type JobInputMode = "url" | "text";
type ResumeInputMode = "upload" | "text";

export function JobInputForm() {
  const router = useRouter();

  // Job input state
  const [jobMode, setJobMode] = useState<JobInputMode>("text");
  const [jobUrl, setJobUrl] = useState("");
  const [jobText, setJobText] = useState("");

  // Resume input state
  const [resumeMode, setResumeMode] = useState<ResumeInputMode>("upload");
  const [resumeText, setResumeText] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  // UI state
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [error, setError] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let finalJobText = jobText;
      let finalResumeText = resumeText;

      // Step 1: Scrape URL if that mode is selected
      if (jobMode === "url") {
        if (!jobUrl.trim()) throw new Error("Please enter a job posting URL");
        setLoadingStep("Fetching job posting...");
        const res = await fetch("/api/scrape-job", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: jobUrl }),
        });
        const data = await res.json();
        if (!res.ok) {
          // Switch to paste mode so the user sees the text input immediately
          setJobMode("text");
          throw new Error(data.error ?? "Failed to fetch job posting");
        }
        finalJobText = data.text;
      } else {
        if (!jobText.trim()) throw new Error("Please paste the job description");
      }

      // Step 2: Parse PDF if file uploaded
      if (resumeMode === "upload") {
        if (!resumeFile) throw new Error("Please upload your resume PDF");
        setLoadingStep("Parsing resume...");
        const formData = new FormData();
        formData.append("file", resumeFile);
        const res = await fetch("/api/parse-resume", { method: "POST", body: formData });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Failed to parse resume");
        finalResumeText = data.text;
      } else {
        if (!resumeText.trim()) throw new Error("Please paste your resume text");
      }

      // Step 3: Run AI analysis (this is the slow part — ~30-60s)
      setLoadingStep("Analyzing with AI (this takes ~30–60 seconds)...");
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobText: finalJobText,
          resumeText: finalResumeText,
          jobUrl: jobMode === "url" ? jobUrl : undefined,
        }),
      });
      const data = await res.json();

      // 429 = free tier limit hit — send to pricing instead of throwing a plain error
      if (res.status === 429) {
        window.location.href = "/pricing";
        return;
      }

      if (!res.ok) throw new Error(data.error ?? "Analysis failed");
      const result: AnalysisResult = data;

      // Store result in sessionStorage so the results page can read it
      // showUpgradePrompt is included in the result and read by the results page
      sessionStorage.setItem(`analysis-${result.id}`, JSON.stringify(result));
      router.push(`/results/${result.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setLoading(false);
      setLoadingStep("");
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        setError("Only PDF files are supported");
        return;
      }
      setResumeFile(file);
      setError("");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Job Posting Section */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-gray-700">Job Posting</label>

        {/* Toggle */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setJobMode("url")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border transition-colors ${
              jobMode === "url"
                ? "bg-gray-900 text-white border-gray-900"
                : "bg-white text-gray-600 border-gray-300 hover:border-gray-400"
            }`}
          >
            <Link size={14} />
            Paste URL
          </button>
          <button
            type="button"
            onClick={() => setJobMode("text")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border transition-colors ${
              jobMode === "text"
                ? "bg-gray-900 text-white border-gray-900"
                : "bg-white text-gray-600 border-gray-300 hover:border-gray-400"
            }`}
          >
            <FileText size={14} />
            Paste Text
          </button>
        </div>

        {jobMode === "url" ? (
          <div className="space-y-1.5">
            <input
              type="url"
              value={jobUrl}
              onChange={(e) => setJobUrl(e.target.value)}
              placeholder="https://linkedin.com/jobs/view/..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              disabled={loading}
            />
            <p className="text-xs text-gray-400">
              Works on most job boards. If it fails, use{" "}
              <button type="button" onClick={() => setJobMode("text")} className="underline hover:text-gray-600">
                Paste Text
              </button>{" "}
              — it always works.
            </p>
          </div>
        ) : (
          <textarea
            value={jobText}
            onChange={(e) => setJobText(e.target.value)}
            placeholder="Paste the full job description here..."
            rows={8}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
            disabled={loading}
          />
        )}
      </div>

      {/* Resume Section */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-gray-700">Your Resume</label>

        {/* Toggle */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setResumeMode("upload")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border transition-colors ${
              resumeMode === "upload"
                ? "bg-gray-900 text-white border-gray-900"
                : "bg-white text-gray-600 border-gray-300 hover:border-gray-400"
            }`}
          >
            <Upload size={14} />
            Upload PDF
          </button>
          <button
            type="button"
            onClick={() => setResumeMode("text")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border transition-colors ${
              resumeMode === "text"
                ? "bg-gray-900 text-white border-gray-900"
                : "bg-white text-gray-600 border-gray-300 hover:border-gray-400"
            }`}
          >
            <FileText size={14} />
            Paste Text
          </button>
        </div>

        {resumeMode === "upload" ? (
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="hidden"
              disabled={loading}
            />
            {resumeFile ? (
              <div className="flex items-center gap-3 p-4 border border-gray-300 rounded-lg bg-gray-50">
                <FileText size={20} className="text-gray-500 shrink-0" />
                <span className="text-sm text-gray-700 flex-1 truncate">{resumeFile.name}</span>
                <button
                  type="button"
                  onClick={() => { setResumeFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                className="w-full p-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors text-center"
              >
                <Upload size={24} className="mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">Click to upload your resume PDF</p>
                <p className="text-xs text-gray-400 mt-1">PDF only, max 5MB</p>
              </button>
            )}
          </div>
        ) : (
          <textarea
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="Paste your resume text here..."
            rows={10}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
            disabled={loading}
          />
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-4 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            {loadingStep || "Processing..."}
          </>
        ) : (
          "Analyze My Application →"
        )}
      </button>

      {loading && (
        <p className="text-center text-xs text-gray-400">
          AI is generating 5 tailored outputs simultaneously. This usually takes 30–60 seconds.
        </p>
      )}
    </form>
  );
}
