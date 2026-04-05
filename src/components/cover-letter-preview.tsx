"use client";

import { useState } from "react";
import { Copy, Check, Download } from "lucide-react";
import { downloadCoverLetterPdf } from "@/lib/pdf/generate-pdf";

interface Props {
  content: string;
}

// Renders cover letter text — simpler than resume, mostly paragraphs
function renderMarkdown(text: string): string {
  return text
    .replace(/^## (.+)$/gm, '<h2 class="text-lg font-bold text-gray-900 mt-6 mb-2">$1</h2>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold">$1</strong>')
    .replace(/\n\n/g, '</p><p class="mb-4 text-gray-700 leading-relaxed">')
    .replace(/\n/g, "<br />");
}

export function CoverLetterPreview({ content }: Props) {
  const [copied, setCopied] = useState(false);

  async function copyToClipboard() {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownload() {
    downloadCoverLetterPdf(content, { filename: "cover-letter.pdf" });
  }

  const renderedContent = `<p class="mb-4 text-gray-700 leading-relaxed">${renderMarkdown(content)}</p>`;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center gap-3">
        <p className="text-sm text-gray-500">
          Personalized for this company and role. Ready to send.
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

      <div
        className="p-8 bg-white border border-gray-200 rounded-lg max-h-[600px] overflow-y-auto"
        dangerouslySetInnerHTML={{ __html: renderedContent }}
      />
    </div>
  );
}
