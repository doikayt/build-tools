import fs from "node:fs";
import path from "node:path";
import GithubSlugger from "github-slugger";
import { parseHeadings } from "./parseHeadings.js";
import type { LinkRecord, LinkValidationError } from "./types.js";

/**
 * Validates a relative file link, including optional anchor fragment.
 *
 * Resolves the target path relative to the source file's directory.
 * If a fragment is present, reads the target file and validates the anchor
 * against its headings.
 */
export function validateRelativeLink(
  sourceFilePath: string,
  link: LinkRecord
): LinkValidationError | null {
  const sourceDir = path.dirname(sourceFilePath);

  const [filePart, fragment] = link.href.split("#");

  const targetPath = path.resolve(sourceDir, filePart);

  if (!fs.existsSync(targetPath)) {
    return {
      file: sourceFilePath,
      line: link.line,
      link: link.href,
      reason: "file not found",
    };
  }

  if (fragment === undefined || fragment === "") {
    return null;
  }

  let targetContent: string;

  try {
    targetContent = fs.readFileSync(targetPath, "utf-8");
  } catch {
    return {
      file: sourceFilePath,
      line: link.line,
      link: link.href,
      reason: "could not read target file",
    };
  }

  const headings = parseHeadings(targetContent);
  const slugger = new GithubSlugger();

  const validSlugs = new Set(headings.map((h) => slugger.slug(h.rawText)));

  if (!validSlugs.has(fragment)) {
    return {
      file: sourceFilePath,
      line: link.line,
      link: link.href,
      reason: "anchor not found in target file",
    };
  }

  return null;
}
