"use client";

interface Props {
  content: string;
}

// Renders the company intel brief markdown into readable sections
function renderMarkdown(text: string): string {
  return text
    .replace(/^### (.+)$/gm, '<h3 class="text-base font-semibold mt-4 mb-1" style="color:#303330;font-family:var(--font-noto-serif),Georgia,serif">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-lg font-bold mt-6 mb-2" style="color:#303330;font-family:var(--font-noto-serif),Georgia,serif">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-xl font-bold mb-4" style="color:#303330;font-family:var(--font-noto-serif),Georgia,serif">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold" style="color:#303330">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em style="color:#5d605c">$1</em>')
    .replace(/^- (.+)$/gm, '<li class="ml-4 text-sm mb-1" style="color:#5d605c">• $1</li>')
    .replace(/\n\n/g, '<br class="block mb-3" />')
    .replace(/\n/g, "\n");
}

export function CompanyIntel({ content }: Props) {
  return (
    <div className="space-y-2">
      <p className="text-sm" style={{ color: "#5d605c" }}>
        Synthesized from the job posting signals — what this company actually values.
      </p>
      <div
        className="p-6 leading-relaxed text-sm max-h-[600px] overflow-y-auto"
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "1.5rem",
          boxShadow: "0px 20px 40px rgba(48,51,48,0.06)",
          color: "#5d605c",
        }}
        dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
      />
    </div>
  );
}
