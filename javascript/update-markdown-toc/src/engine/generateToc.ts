import { parseHeadings } from "@datalackey/tooling-core";

const START = "<!-- TOC:START -->";
const END = "<!-- TOC:END -->";

export function stripInlineCode(text: string): string {
  // [^`\n]* — any char except backtick or newline (inline spans can't cross lines)
  // Replace with "" not "``" — substituting backticks reintroduces spans that eat surrounding text
  return text.replace(/`[^`\n]*`/g, "");
}

function detectLineEnding(text: string): "\r\n" | "\n" {
  return text.includes("\r\n") ? "\r\n" : "\n";
}

export function generateTOC(content: string): string {
  const lineEnding = detectLineEnding(content);

  const stripped = stripInlineCode(content);
  const hasStart = stripped.includes(START);
  const hasEnd = stripped.includes(END);

  if (!hasStart && !hasEnd) throw new Error("TOC delimiters not found");
  if (hasStart && !hasEnd)
    throw new Error("TOC start delimiter found without end");
  if (!hasStart && hasEnd)
    throw new Error("TOC end delimiter found without start");

  const startIndex = content.indexOf(START);
  const endIndex = content.indexOf(END);

  const before = content.slice(0, startIndex);
  const after = content.slice(endIndex + END.length);

  // Two line endings (a blank line) are required between before and after so
  // that any open HTML block in `before` (e.g. a closing </p> tag with no
  // trailing blank line) is closed before remark parses `after`. A single \n
  // is not enough — CommonMark only closes an HTML block at a blank line.
  const contentWithoutTOC =
    before.replace(/\s*$/, "") +
    lineEnding +
    lineEnding +
    after.replace(/^\s*/, "");

  // parseHeadings (remark/CommonMark) also returns setext-style headings — text
  // immediately followed by `---` or `===` on the next line. This is valid
  // CommonMark but users writing `paragraph\n---` as a paragraph + horizontal
  // rule (a very common pattern) will unintentionally produce TOC entries.
  // We restrict to ATX-style headings (lines starting with `#`) which are the
  // only form a user would deliberately put in a TOC.
  const sourceLines = contentWithoutTOC.split(lineEnding);
  const headings = parseHeadings(contentWithoutTOC).filter(
    (h) => h.line > 0 && /^#{1,6}\s/.test(sourceLines[h.line - 1] ?? "")
  );

  if (headings.length === 0) {
    throw new Error("No headings found to generate TOC");
  }

  const minLevel = Math.min(...headings.map((h) => h.level));

  const tocLines = headings.map((h) => {
    const indent = "  ".repeat(h.level - minLevel);
    return `${indent}- [${h.rawText}](#${h.slug})`;
  });

  const tocBlock = lineEnding + tocLines.join(lineEnding) + lineEnding;

  return before + START + tocBlock + END + after;
}
