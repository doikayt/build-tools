/**
 * Extracts a one-line summary from `text` (typically a JSDoc description with
 * /** *\/ markers and leading * already stripped by ts-morph).
 *
 * Rules (applied in order):
 *  1. If the text has more than one line and the first line is followed by a
 *     blank line → return the first line (intentional standalone paragraph).
 *  2. Otherwise join all non-blank lines with a single space and return
 *     everything up to and including the first period.
 *  3. If no period, return the full joined text.
 */
export function extractFirstSentence(text: string): string {
  const lines = text.split("\n").map((l) => l.trim());

  if (lines.length === 0 || (lines.length === 1 && lines[0] === "")) return "";

  // Blank line after first line signals an intentional paragraph break.
  if (lines.length > 1 && lines[1] === "") {
    return lines[0];
  }

  const joined = lines.filter((l) => l !== "").join(" ");
  const dotIdx = joined.indexOf(".");
  if (dotIdx === -1) return joined;
  return joined.slice(0, dotIdx + 1);
}
