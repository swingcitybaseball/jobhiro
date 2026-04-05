// Resume PDF parser — extracts raw text from uploaded PDF files
// Uses pdf-parse v1 (Node.js only — must run server-side)
// v1 is a plain async function: pdfParse(buffer) => { text, numpages, ... }

export async function parseResumePdf(buffer: Buffer): Promise<string> {
  // Import from the internal lib file, NOT the package root.
  // The package root (index.js) runs a self-test on load that tries to read
  // "test/data/05-versions-space.pdf" from disk — that file won't exist in
  // production and causes a misleading error. The lib file is the actual parser.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pdfParse = require("pdf-parse/lib/pdf-parse.js");
  const data = await pdfParse(buffer);

  // Clean up the extracted text — PDFs often have weird spacing
  const cleaned = (data.text as string)
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/[ \t]{3,}/g, "  ")   // collapse excessive spaces/tabs
    .replace(/\n{4,}/g, "\n\n\n")  // collapse excessive blank lines
    .trim();

  return cleaned;
}
