import fs from "node:fs";
import path from "node:path";

const COMPONENT_INFO_FILE = "_COMPONENT_INFO.md";

/**
 * Reads the first sentence (ending with '.') from _COMPONENT_INFO.md in leafDir.
 * Collapses whitespace and newlines before extracting the sentence so
 * descriptions that wrap across lines are handled correctly.
 * Returns undefined if the file is absent, empty, or contains no period.
 * Warns if content is present but no period is found.
 */
export function readComponentDescription(
  leafDir: string,
  onWarn?: (message: string) => void
): string | undefined {
  const filePath = path.join(leafDir, COMPONENT_INFO_FILE);

  if (!fs.existsSync(filePath)) {
    return undefined;
  }

  const content = fs.readFileSync(filePath, "utf-8");
  const collapsed = content.replace(/\s+/g, " ").trim();

  if (collapsed.length === 0) {
    return undefined;
  }

  const strippedForSearch = collapsed.replace(/`[^`\n]*`/g, (m) =>
    " ".repeat(m.length)
  );
  const dotIndex = strippedForSearch.indexOf(".");
  if (dotIndex === -1) {
    const warn = onWarn ?? ((msg) => console.warn(msg));
    warn(
      `Warning: "${filePath}" contains no period — description must end with '.'`
    );
    return undefined;
  }

  const sentence = collapsed.slice(0, dotIndex).trim();
  return sentence.length > 0 ? sentence : undefined;
}
