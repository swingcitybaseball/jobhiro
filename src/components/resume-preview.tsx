"use client";

import { useState } from "react";
import { Copy, Check, Download } from "lucide-react";
import { downloadResumePdf } from "@/lib/pdf/generate-pdf";

interface Props {
  content: string;
}

// Renders the tailored resume markdown as formatted text
// Simple markdown → HTML conversion for the key elements we care about
function renderMarkdown(text: string): string {
  return text
    .replace(/^### (.+)$/gm, '<h3 class="text-base font-semibold text-gray-800 mt-4 mb-1">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-lg font-bold text-gray-900 mt-6 mb-2 border-b border-gray-200 pb-1">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-xl font-bold text-gray-900 mb-1">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^- (.+)$/gm, '<li class="ml-4 text-gray-700 text-sm">• $1</li>')
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
        <p className="text-sm text-gray-500">
          ATS-optimized and tailored for this specific role.
        </p>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={copyToClipboard}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
            {copied ? "Copied!" : "Copy"}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gray-900 hover:bg-gray-800 text-white rounded-lg transition-colors"
          >
            <Download size={14} />
            Download PDF
          </button>
        </div>
      </div>

      {/* Resume content */}
      <div
        className="p-6 bg-white border border-gray-200 rounded-lg font-mono text-sm leading-relaxed whitespace-pre-wrap text-gray-800 max-h-[600px] overflow-y-auto"
        dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
      />
    </div>
  );
}
