// Client-side PDF generation using jspdf
// Produces clean, text-based PDFs that ATS systems can parse correctly.
// No images, no canvas — just real selectable text.

import { jsPDF } from "jspdf";

// Page geometry constants (all in mm, A4-letter hybrid at 8.5x11in)
const PAGE_W = 215.9;   // 8.5 inches in mm
const PAGE_H = 279.4;   // 11 inches in mm
const MARGIN = 25.4;    // 1 inch margins
const CONTENT_W = PAGE_W - MARGIN * 2;

// Font sizes
const SIZE_NAME    = 16;
const SIZE_H1      = 13;
const SIZE_H2      = 11;
const SIZE_H3      = 10;
const SIZE_BODY    = 10;
const SIZE_SMALL   = 9;

// Line heights (mm)
const LH_H1   = 7;
const LH_H2   = 6;
const LH_BODY = 5.5;
const LH_SMALL = 5;

// Spacing between sections (mm)
const SPACE_AFTER_HEADER = 4;
const SPACE_AFTER_SECTION = 3;
const SPACE_AFTER_H2 = 2;

interface PdfOptions {
  filename: string;
}

// Creates a new jsPDF instance with letter paper
function newDoc(): jsPDF {
  return new jsPDF({ unit: "mm", format: "letter", orientation: "portrait" });
}

// Adds text that wraps at CONTENT_W, returns new Y position.
// Automatically adds a new page if needed.
function addWrappedText(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
): number {
  const lines = doc.splitTextToSize(text, maxWidth) as string[];
  for (const line of lines) {
    if (y > PAGE_H - MARGIN) {
      doc.addPage();
      y = MARGIN;
    }
    doc.text(line, x, y);
    y += lineHeight;
  }
  return y;
}

// Adds a horizontal rule line
function addRule(doc: jsPDF, y: number): number {
  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.2);
  doc.line(MARGIN, y, PAGE_W - MARGIN, y);
  return y + 3;
}

// Strips markdown formatting symbols from a string, leaving plain text
function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "$1")  // bold
    .replace(/\*(.+?)\*/g, "$1")       // italic
    .replace(/`(.+?)`/g, "$1")         // inline code
    .replace(/\*\*/g, "")              // leftover bold markers
    .replace(/\*/g, "");               // leftover italic markers
}

// Parses a markdown line and renders it with appropriate formatting.
// Returns the new Y cursor position.
function renderLine(doc: jsPDF, line: string, y: number): number {
  const trimmed = line.trim();

  // Blank line — small gap
  if (!trimmed) {
    return y + 2;
  }

  // Skip markdown table rows (pipes) and horizontal rules — can't render in PDF
  if (/^\|/.test(trimmed) || /^[-|]+$/.test(trimmed)) {
    return y;
  }

  // H1: # Name / Title  (used for candidate name at top of resume)
  if (/^# /.test(trimmed)) {
    const text = stripMarkdown(trimmed.replace(/^# /, ""));
    doc.setFont("helvetica", "bold");
    doc.setFontSize(SIZE_NAME);
    y = addWrappedText(doc, text, MARGIN, y, CONTENT_W, LH_H1 + 2);
    return y + 1;
  }

  // H2: ## Section Header (e.g. "Experience", "Skills")
  if (/^## /.test(trimmed)) {
    const text = stripMarkdown(trimmed.replace(/^## /, "")).toUpperCase();
    y += SPACE_AFTER_SECTION;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(SIZE_H1);
    y = addWrappedText(doc, text, MARGIN, y, CONTENT_W, LH_H1);
    y = addRule(doc, y);
    return y + SPACE_AFTER_H2;
  }

  // H3: ### Subsection (e.g. job title + company)
  if (/^### /.test(trimmed)) {
    const text = stripMarkdown(trimmed.replace(/^### /, ""));
    doc.setFont("helvetica", "bold");
    doc.setFontSize(SIZE_H2);
    y = addWrappedText(doc, text, MARGIN, y, CONTENT_W, LH_H2);
    return y + 1;
  }

  // Bullet point: - item or * item
  if (/^[-*] /.test(trimmed)) {
    const text = stripMarkdown(trimmed.replace(/^[-*] /, ""));
    doc.setFont("helvetica", "normal");
    doc.setFontSize(SIZE_BODY);
    // bulletWidth must account for the indented X position so splitTextToSize
    // wraps before the right margin, not beyond it
    const bulletX = MARGIN + 4;
    const bulletWidth = CONTENT_W - 4;  // matches the 4mm indent at bulletX
    doc.text("•", MARGIN + 1, y);
    y = addWrappedText(doc, text, bulletX, y, bulletWidth, LH_BODY);
    return y;
  }

  // Bold-only line (standalone **text** — used for job date ranges etc.)
  if (/^\*\*.+\*\*$/.test(trimmed)) {
    const text = stripMarkdown(trimmed);
    doc.setFont("helvetica", "bolditalic");
    doc.setFontSize(SIZE_SMALL);
    y = addWrappedText(doc, text, MARGIN, y, CONTENT_W, LH_SMALL);
    return y + 1;
  }

  // Regular paragraph — strip any remaining markdown emphasis
  const text = stripMarkdown(trimmed);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(SIZE_BODY);
  y = addWrappedText(doc, text, MARGIN, y, CONTENT_W, LH_BODY);
  return y;
}

// ─── Public API ─────────────────────────────────────────────────────────────

// Generates a clean resume PDF from markdown content and triggers download.
export function downloadResumePdf(markdownText: string, options: PdfOptions): void {
  const doc = newDoc();
  let y = MARGIN;

  const lines = markdownText.split("\n");
  for (const line of lines) {
    y = renderLine(doc, line, y);
  }

  doc.save(options.filename);
}

// Generates a clean cover letter PDF from markdown content and triggers download.
// Cover letters get slightly larger body text and more generous spacing.
export function downloadCoverLetterPdf(markdownText: string, options: PdfOptions): void {
  const doc = newDoc();
  let y = MARGIN;

  const lines = markdownText.split("\n");

  for (const line of lines) {
    const trimmed = line.trim();

    // Blank line — more breathing room in cover letters
    if (!trimmed) {
      y += 4;
      continue;
    }

    // Section headers (## Dear Hiring Manager, etc.)
    if (/^## /.test(trimmed)) {
      const text = trimmed.replace(/^## /, "").replace(/\*\*/g, "");
      y += SPACE_AFTER_SECTION;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(SIZE_H2);
      y = addWrappedText(doc, text, MARGIN, y, CONTENT_W, LH_H2 + 1);
      continue;
    }

    // Strip markdown emphasis, render as readable paragraph text
    const text = trimmed.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\*(.+?)\*/g, "$1");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(SIZE_H3 + 1); // 11pt — slightly larger for cover letters
    y = addWrappedText(doc, text, MARGIN, y, CONTENT_W, LH_BODY + 1.5);
  }

  // Footer with page number if multi-page
  const pageCount = doc.getNumberOfPages();
  if (pageCount > 1) {
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(SIZE_SMALL - 1);
      doc.setTextColor(150, 150, 150);
      doc.text(`Page ${i} of ${pageCount}`, PAGE_W / 2, PAGE_H - 10, { align: "center" });
      doc.setTextColor(0, 0, 0);
    }
  }

  doc.save(options.filename);
}
