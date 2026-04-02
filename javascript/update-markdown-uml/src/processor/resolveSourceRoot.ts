import fs from "node:fs";
import path from "node:path";

/**
 * Resolves the source root directory for UML diagram generation.
 * Priority:
 *   1. config.sourceRoot if explicitly provided
 *   2. src/ relative to the markdown file's directory, if it exists
 *   3. The markdown file's directory itself
 */
export function resolveSourceRoot(
  markdownFile: string,
  sourceRoot: string | undefined
): string {
  if (sourceRoot !== undefined) {
    return path.resolve(sourceRoot);
  }

  const markdownDir = path.dirname(path.resolve(markdownFile));
  const srcDir = path.join(markdownDir, "src");

  if (fs.existsSync(srcDir) && fs.statSync(srcDir).isDirectory()) {
    return srcDir;
  }

  return markdownDir;
}
