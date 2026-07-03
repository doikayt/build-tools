/**
 * Returns the first sentence of `text`: everything up to and including the
 * first period, or up to (not including) the first newline — whichever comes
 * first. Returns the full string when neither is found.
 */
export function extractFirstSentence(text: string): string {
  const dotIdx = text.indexOf(".");
  const nlIdx = text.indexOf("\n");
  if (dotIdx === -1 && nlIdx === -1) return text;
  const cutDot = dotIdx === -1 ? Infinity : dotIdx;
  const cutNl = nlIdx === -1 ? Infinity : nlIdx;
  if (cutDot <= cutNl) {
    return text.slice(0, dotIdx + 1);
  }
  return text.slice(0, nlIdx);
}
