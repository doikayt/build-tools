import fs from "node:fs";
import path from "node:path";
import micromatch from "micromatch";

/**
 * Discovers leaf package directories under sourceRoot.
 * A leaf is a directory that contains at least one qualifying .ts file
 * (after filtering skipTestPatterns) at any depth under sourceRoot.
 * Root-level files are ignored — only subdirectories are considered.
 * A directory that has both qualifying .ts files AND qualifying child
 * directories is included as a leaf itself AND its children are also
 * included — a warning is emitted to surface the mixed-concern smell.
 * Returns sorted absolute paths.
 */
export function discoverLeafPackages(
  sourceRoot: string,
  skipTestPatterns: string[]
): string[] {
  const results: string[] = [];
  walk(sourceRoot, sourceRoot, skipTestPatterns, results);
  return results.sort((a, b) => a.localeCompare(b));
}

function hasQualifyingTsFiles(
  dirPath: string,
  skipTestPatterns: string[]
): boolean {
  const files = fs
    .readdirSync(dirPath, { withFileTypes: true })
    .filter((e) => e.isFile() && e.name.endsWith(".ts"))
    .map((e) => e.name);

  const remaining =
    skipTestPatterns.length > 0
      ? micromatch.not(files, skipTestPatterns)
      : files;

  return remaining.length > 0;
}

function walk(
  currentDir: string,
  sourceRoot: string,
  skipTestPatterns: string[],
  results: string[]
): void {
  const entries = fs.readdirSync(currentDir, { withFileTypes: true });

  const subdirs = entries
    .filter((e) => e.isDirectory())
    .map((e) => path.join(currentDir, e.name));

  const qualifyingSubdirs = subdirs.filter((sub) =>
    subtreeHasQualifyingFiles(sub, skipTestPatterns)
  );

  const selfQualifies =
    currentDir !== sourceRoot &&
    hasQualifyingTsFiles(currentDir, skipTestPatterns);

  const hasQualifyingChildren = qualifyingSubdirs.length > 0;

  if (selfQualifies && hasQualifyingChildren) {
    console.warn(
      `Warning: "${path.relative(
        sourceRoot,
        currentDir
      )}" contains both .ts files and qualifying subdirectories — mixed concern detected`
    );
    results.push(currentDir);
  } else if (selfQualifies) {
    results.push(currentDir);
    return; // leaf — do not descend
  }

  for (const sub of subdirs) {
    walk(sub, sourceRoot, skipTestPatterns, results);
  }
}

function subtreeHasQualifyingFiles(
  dirPath: string,
  skipTestPatterns: string[]
): boolean {
  if (hasQualifyingTsFiles(dirPath, skipTestPatterns)) return true;

  const subdirs = fs
    .readdirSync(dirPath, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => path.join(dirPath, e.name));

  return subdirs.some((sub) =>
    subtreeHasQualifyingFiles(sub, skipTestPatterns)
  );
}
