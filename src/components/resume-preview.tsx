"use client";

import { useState } from "react";
import { Copy, Check, Download } from "lucide-react";
import { downloadResumePdf } from "@/lib/pdf/generate-pdf";

interface Props {
  content: string;
}

// Renders the tailored resume markdown as formatted text
function renderMarkdown(text: string): string {
  return text
    .replace(/^### (.+)$/gm, '<h3 class="text-base font-semibold mt-4 mb-1" style="color:#303330;font-family:var(--font-noto-serif),Georgia,serif">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-lg font-bold mt-6 mb-2 pb-1" style="color:#303330;font-family:var(--font-noto-serif),Georgia,serif;border-bottom:1px solid rgba(177,178,175,0.4)">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-xl font-bold mb-1" style="color:#303330;font-family:var(--font-noto-serif),Georgia,serif">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^- (.+)$/gm, '<li class="ml-4 text-sm" style="color:#5d605c">• $1</li>')
    .replace(/\n\n/g, '<br class="block mb-2" />')
    .replace(/\n/g, "\n");
}

export function ResumePreview({ content }: Props) {
  const [copied, setCopied] = useState(false);

  async function copyToClipboard() {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownload() {
    downloadResumePdf(content, { filename: "tailored-resume.pdf" });
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center gap-3">
        <p className="text-sm" style={{ color: "#5d605c" }}>
          ATS-optimized and tailored for this specific role.
        </p>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={copyToClipboard}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors hover:scale-95"
            style={{ borderRadius: "9999px", backgroundColor: "#eeeeea", color: "#303330" }}
          >
            {copied ? <Check size={13} style={{ color: "#44683b" }} /> : <Copy size={13} />}
            {copied ? "Copied!" : "Copy"}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-on-primary transition-all hover:scale-95"
            style={{ borderRadius: "9999px", background: "linear-gradient(135deg, #a43e24, #ffac98)" }}
          >
            <Download size={13} />
            Download PDF
          </button>
        </div>
      </div>

      <div
        className="p-6 text-sm leading-relaxed whitespace-pre-wrap max-h-[600px] overflow-y-auto"
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "1.5rem",
          boxShadow: "0px 20px 40px rgba(48,51,48,0.06)",
          color: "#303330",
          fontFamily: "var(--font-inter), sans-serif",
        }}
        dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
      />
    </div>
  );
}
