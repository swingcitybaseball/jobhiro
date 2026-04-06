"use client";

import { useState } from "react";
import { Copy, Check, Download } from "lucide-react";
import { downloadCoverLetterPdf } from "@/lib/pdf/generate-pdf";

interface Props {
  content: string;
}

// Renders cover letter text — mostly paragraphs
function renderMarkdown(text: string): string {
  return text
    .replace(/^## (.+)$/gm, '<h2 class="text-lg font-bold mt-6 mb-2" style="color:#303330;font-family:var(--font-noto-serif),Georgia,serif">$1</h2>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold">$1</strong>')
    .replace(/\n\n/g, '</p><p class="mb-4 leading-relaxed" style="color:#5d605c">')
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

  const renderedContent = `<p class="mb-4 leading-relaxed" style="color:#5d605c">${renderMarkdown(content)}</p>`;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center gap-3">
        <p className="text-sm" style={{ color: "#5d605c" }}>
          Personalized for this company and role. Ready to send.
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
        className="p-8 max-h-[600px] overflow-y-auto text-sm"
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "1.5rem",
          boxShadow: "0px 20px 40px rgba(48,51,48,0.06)",
        }}
        dangerouslySetInnerHTML={{ __html: renderedContent }}
      />
    </div>
  );
}
