import type {
  LinkRecord,
  HeadingRecord,
  LinkValidationError,
} from "./types.js";

/**
 * Validates a fragment-only link (e.g. #my-heading) against the headings
 * of the current file.
 *
 * Pure function — no I/O.
 */
export function validateFragmentLink(
  sourceFilePath: string,
  link: LinkRecord,
  headings: HeadingRecord[]
): LinkValidationError | null {
  const fragment = link.href.slice(1);
  const validSlugs = new Set(headings.map((h) => h.slug));

  if (!validSlugs.has(fragment)) {
    return {
      file: sourceFilePath,
      line: link.line,
      link: link.href,
      reason: "anchor not found in current file",
    };
  }

  return null;
}
