"use client";

interface Props {
  content: string;
}

// Renders the company intel brief markdown into readable sections
function renderMarkdown(text: string): string {
  return text
    .replace(/^### (.+)$/gm, '<h3 class="text-base font-semibold text-gray-800 mt-4 mb-1">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-lg font-bold text-gray-900 mt-6 mb-2">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-xl font-bold text-gray-900 mb-4">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em class="text-gray-700">$1</em>')
    .replace(/^- (.+)$/gm, '<li class="ml-4 text-gray-700 text-sm mb-1">• $1</li>')
    .replace(/\n\n/g, '<br class="block mb-3" />')
    .replace(/\n/g, "\n");
}

export function CompanyIntel({ content }: Props) {
  return (
    <div className="space-y-2">
      <p className="text-sm text-gray-500">
        Synthesized from the job posting signals — what this company actually values.
      </p>
      <div
        className="p-6 bg-white border border-gray-200 rounded-lg leading-relaxed text-sm max-h-[600px] overflow-y-auto"
        dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
      />
    </div>
  );
}
