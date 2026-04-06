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

      // Step 3: Run AI analysis (~30-60s)
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

      // 429 = free tier limit hit — send to pricing
      if (res.status === 429) {
        window.location.href = "/pricing";
        return;
      }

      if (!res.ok) throw new Error(data.error ?? "Analysis failed");
      const result: AnalysisResult = data;

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

  const activeToggleStyle = {
    background: "linear-gradient(135deg, #a43e24, #ffac98)",
    color: "#fff7f6",
    borderColor: "transparent",
  };
  const inactiveToggleStyle = {
    background: "#ffffff",
    color: "#5d605c",
    borderColor: "#b1b2af",
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Job Posting Section */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-on-surface">Job Posting</label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setJobMode("url")}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium border transition-all hover:scale-95"
            style={{ borderRadius: "9999px", ...(jobMode === "url" ? activeToggleStyle : inactiveToggleStyle) }}
          >
            <Link size={13} />
            Paste URL
          </button>
          <button
            type="button"
            onClick={() => setJobMode("text")}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium border transition-all hover:scale-95"
            style={{ borderRadius: "9999px", ...(jobMode === "text" ? activeToggleStyle : inactiveToggleStyle) }}
          >
            <FileText size={13} />
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
              className="w-full px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none transition-colors"
              style={{
                borderRadius: "1rem",
                backgroundColor: "#f4f4f0",
                border: "2px solid transparent",
              }}
              onFocus={(e) => { e.currentTarget.style.backgroundColor = "#ffffff"; e.currentTarget.style.borderColor = "rgba(164,62,36,0.2)"; }}
              onBlur={(e) => { e.currentTarget.style.backgroundColor = "#f4f4f0"; e.currentTarget.style.borderColor = "transparent"; }}
              disabled={loading}
            />
            <p className="text-xs text-on-surface-variant">
              Works on most job boards. If it fails, use{" "}
              <button type="button" onClick={() => setJobMode("text")} className="underline hover:text-primary">
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
            className="w-full px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none resize-none transition-colors"
            style={{
              borderRadius: "1rem",
              backgroundColor: "#f4f4f0",
              border: "2px solid transparent",
            }}
            onFocus={(e) => { e.currentTarget.style.backgroundColor = "#ffffff"; e.currentTarget.style.borderColor = "rgba(164,62,36,0.2)"; }}
            onBlur={(e) => { e.currentTarget.style.backgroundColor = "#f4f4f0"; e.currentTarget.style.borderColor = "transparent"; }}
            disabled={loading}
          />
        )}
      </div>

      {/* Resume Section */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-on-surface">Your Resume</label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setResumeMode("upload")}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium border transition-all hover:scale-95"
            style={{ borderRadius: "9999px", ...(resumeMode === "upload" ? activeToggleStyle : inactiveToggleStyle) }}
          >
            <Upload size={13} />
            Upload PDF
          </button>
          <button
            type="button"
            onClick={() => setResumeMode("text")}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium border transition-all hover:scale-95"
            style={{ borderRadius: "9999px", ...(resumeMode === "text" ? activeToggleStyle : inactiveToggleStyle) }}
          >
            <FileText size={13} />
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
              <div
                className="flex items-center gap-3 p-4"
                style={{ borderRadius: "1rem", backgroundColor: "#f4f4f0" }}
              >
                <FileText size={20} className="text-on-surface-variant shrink-0" />
                <span className="text-sm text-on-surface flex-1 truncate">{resumeFile.name}</span>
                <button
                  type="button"
                  onClick={() => { setResumeFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                  className="text-on-surface-variant hover:text-on-surface"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                className="w-full p-8 border-2 border-dashed border-outline-variant hover:border-primary transition-colors text-center"
                style={{ borderRadius: "1rem" }}
              >
                <Upload size={24} className="mx-auto text-on-surface-variant mb-2" />
                <p className="text-sm text-on-surface-variant">Click to upload your resume PDF</p>
                <p className="text-xs text-on-surface-variant/60 mt-1">PDF only, max 5MB</p>
              </button>
            )}
          </div>
        ) : (
          <textarea
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="Paste your resume text here..."
            rows={10}
            className="w-full px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none resize-none transition-colors"
            style={{
              borderRadius: "1rem",
              backgroundColor: "#f4f4f0",
              border: "2px solid transparent",
            }}
            onFocus={(e) => { e.currentTarget.style.backgroundColor = "#ffffff"; e.currentTarget.style.borderColor = "rgba(164,62,36,0.2)"; }}
            onBlur={(e) => { e.currentTarget.style.backgroundColor = "#f4f4f0"; e.currentTarget.style.borderColor = "transparent"; }}
            disabled={loading}
          />
        )}
      </div>

      {/* Error */}
      {error && (
        <div
          className="p-4 text-sm text-error"
          style={{ borderRadius: "1rem", backgroundColor: "rgba(170,55,28,0.08)" }}
        >
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-4 font-bold text-on-primary disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 hover:scale-[1.01]"
        style={{
          borderRadius: "9999px",
          background: loading ? "#b1b2af" : "linear-gradient(135deg, #a43e24, #ffac98)",
          boxShadow: loading ? "none" : "0px 8px 24px rgba(164, 62, 36, 0.3)",
        }}
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
        <p className="text-center text-xs text-on-surface-variant">
          AI is generating 5 tailored outputs simultaneously. This usually takes 30–60 seconds.
        </p>
      )}
    </form>
  );
}
