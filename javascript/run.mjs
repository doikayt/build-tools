// write-flowchart-compact-and-collision-fix.mjs
// Run from: javascript/
// Overwrites:
//   update-markdown-uml/src/generators/buildPackagesFlowchart.ts
//   update-markdown-uml/src/processor/UmlFileProcessor.ts
//   update-markdown-uml/src/markdown/injectUmlSections.ts
//   update-markdown-uml/tests/generators/buildPackagesFlowchart.test.ts

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

const files = {
  // -------------------------------------------------------
  // buildPackagesFlowchart — compact, no types in subgraphs
  // -------------------------------------------------------

  "update-markdown-uml/src/generators/buildPackagesFlowchart.ts": `import type { ImportEdge } from "../analysis/analyzeImportDependencies.js";

/**
 * Builds a Mermaid flowchart TB diagram showing leaf packages as compact
 * subgraphs with inter-package import dependency arrows.
 *
 * Each subgraph shows only the package name — type details are available
 * in the per-package classDiagram sections below. This keeps the overview
 * diagram readable regardless of how many types each package contains.
 *
 * Packages and edges are rendered in lexicographic order for determinism.
 */
export function buildPackagesFlowchart(
  packages: string[],
  edges: ImportEdge[]
): string {
  const sortedPackages = [...packages].sort((a, b) => a.localeCompare(b));
  const sortedEdges = [...edges].sort((a, b) =>
    a.from !== b.from ? a.from.localeCompare(b.from) : a.to.localeCompare(b.to)
  );

  const lines: string[] = [];
  lines.push("flowchart TB");

  for (const pkg of sortedPackages) {
    lines.push(\`  subgraph \${pkg}["\${pkg}"]\`);
    lines.push(\`  end\`);
  }

  if (sortedEdges.length > 0) {
    lines.push("");
    for (const edge of sortedEdges) {
      lines.push(\`  \${edge.from} --> \${edge.to}\`);
    }
  }

  return "\`\`\`mermaid\\n" + lines.join("\\n") + "\\n\`\`\`";
}
`,

  // -------------------------------------------------------
  // UmlFileProcessor — remove typesByPackage, extractTypeNames
  // -------------------------------------------------------

  "update-markdown-uml/src/processor/UmlFileProcessor.ts": `import fs from "node:fs";
import path from "node:path";
import type { FileProcessor, ProcessingStatus } from "@datalackey/tooling-core";
import { debugLog } from "@datalackey/tooling-core";
import type { UmlRunConfig } from "../cli/UmlRunConfig.js";
import { discoverLeafPackages } from "../discovery/discoverLeafPackages.js";
import { readPackageDescription } from "../discovery/readPackageDescription.js";
import { analyzeImportDependencies } from "../analysis/analyzeImportDependencies.js";
import { buildPackagesFlowchart } from "../generators/buildPackagesFlowchart.js";
import { buildPackagesTable } from "../generators/buildPackagesTable.js";
import { buildPackageClassDiagram } from "../generators/buildPackageClassDiagram.js";
import { injectUmlSections } from "../markdown/injectUmlSections.js";
import { resolveSourceRoot } from "./resolveSourceRoot.js";

const DEFAULT_SKIP_TEST_PATTERNS = ["*.test.ts", "*.spec.ts"];

export class UmlFileProcessor implements FileProcessor<UmlRunConfig> {
  process(filePath: string, config: UmlRunConfig): ProcessingStatus {
    debugLog(config, \`UmlFileProcessor: entry filePath=\${filePath}\`);

    const sourceRoot = resolveSourceRoot(filePath, config.sourceRoot);
    debugLog(config, \`UmlFileProcessor: sourceRoot=\${sourceRoot}\`);

    const rawPatterns = config.skipTestPatterns as string[] | undefined;
    const skipPatterns: string[] =
      rawPatterns !== undefined && rawPatterns.length > 0
        ? rawPatterns
        : DEFAULT_SKIP_TEST_PATTERNS;

    // 1. Discover leaf packages
    const leafDirs = discoverLeafPackages(sourceRoot, skipPatterns);
    debugLog(config, \`UmlFileProcessor: leafDirs=\${JSON.stringify(leafDirs)}\`);

    const leafNames = leafDirs.map((d) => path.basename(d));

    // Warn about excluded packages not found
    for (const excluded of config.excludePackages) {
      if (!leafNames.includes(excluded)) {
        if (!config.quiet) {
          console.warn(
            \`Warning: excluded package "\${excluded}" not found under source root "\${sourceRoot}"\`
          );
        }
      }
    }

    const activeLeafDirs = leafDirs.filter(
      (d) => !config.excludePackages.includes(path.basename(d))
    );
    const activeLeafNames = activeLeafDirs.map((d) => path.basename(d));

    // 2. Read package descriptions
    const onWarn = config.quiet
      ? undefined
      : (msg: string) => console.warn(msg);

    const descriptions = new Map<string, string | undefined>();
    for (const leafDir of activeLeafDirs) {
      const name = path.basename(leafDir);
      descriptions.set(name, readPackageDescription(leafDir, onWarn));
    }

    // 3. Analyze import dependencies
    const edges = analyzeImportDependencies(activeLeafDirs, sourceRoot);
    debugLog(config, \`UmlFileProcessor: edges=\${JSON.stringify(edges)}\`);

    // 4. Build flowchart (compact — package names only, no type enumeration)
    const packagesContent = buildPackagesFlowchart(activeLeafNames, edges);

    // 5. Build packages table
    const packagesTableContent = buildPackagesTable(
      activeLeafNames,
      descriptions
    );

    // 6. Build per-package class diagrams
    const detailSections = activeLeafDirs.map((leafDir) => {
      const name = path.basename(leafDir);
      const diagram = buildPackageClassDiagram(leafDir);
      return \`#### \${name}\\n\${diagram}\`;
    });
    const packageDetailsContent = detailSections.join("\\n\\n");

    // 7. Inject into markdown file
    const original = fs.readFileSync(filePath, "utf-8");

    const updated = injectUmlSections(
      original,
      {
        packages: packagesContent,
        packagesTable: packagesTableContent,
        packageDetails: packageDetailsContent,
      },
      activeLeafNames,
      onWarn
    );

    // 8. Compare and return status
    if (updated === original) {
      debugLog(config, \`UmlFileProcessor: unchanged filePath=\${filePath}\`);
      return "unchanged";
    }

    if (config.runMode === "check") {
      debugLog(config, \`UmlFileProcessor: needsUpdate filePath=\${filePath}\`);
      return "needsUpdate";
    }

    fs.writeFileSync(filePath, updated, "utf-8");
    debugLog(config, \`UmlFileProcessor: updated filePath=\${filePath}\`);
    return "updated";
  }
}
`,

  // -------------------------------------------------------
  // injectUmlSections — fix collision check to exclude
  // generated package-details headings
  // -------------------------------------------------------

  "update-markdown-uml/src/markdown/injectUmlSections.ts": `import { findMarkers, parseHeadings } from "@datalackey/tooling-core";
import GithubSlugger from "github-slugger";

const MARKER_PACKAGES_START = "<!-- UML:packages:START -->";
const MARKER_PACKAGES_END = "<!-- UML:packages:END -->";
const MARKER_PACKAGES_TABLE_START = "<!-- UML:packages-table:START -->";
const MARKER_PACKAGES_TABLE_END = "<!-- UML:packages-table:END -->";
const MARKER_PACKAGE_DETAILS_START = "<!-- UML:package-details:START -->";
const MARKER_PACKAGE_DETAILS_END = "<!-- UML:package-details:END -->";

export const UML_MARKERS = {
  PACKAGES_START: MARKER_PACKAGES_START,
  PACKAGES_END: MARKER_PACKAGES_END,
  PACKAGES_TABLE_START: MARKER_PACKAGES_TABLE_START,
  PACKAGES_TABLE_END: MARKER_PACKAGES_TABLE_END,
  PACKAGE_DETAILS_START: MARKER_PACKAGE_DETAILS_START,
  PACKAGE_DETAILS_END: MARKER_PACKAGE_DETAILS_END,
} as const;

export interface UmlSections {
  packages: string;
  packagesTable: string;
  packageDetails: string;
}

/**
 * Injects UML-generated content into a Markdown file between the three
 * standard UML marker pairs. Uses findMarkers to locate all pairs in a
 * single pass.
 *
 * Missing marker pairs are silently skipped — not every document needs
 * all three sections. Duplicate or malformed marker pairs throw (via
 * findMarkers).
 *
 * Warns via onWarn if any generated package heading anchor (#### <pkg>)
 * collides with an existing heading slug OUTSIDE the package-details
 * marker region. Headings inside the package-details region are ones we
 * generated ourselves on a previous run and are not real collisions.
 */
export function injectUmlSections(
  content: string,
  sections: UmlSections,
  packageNames: string[],
  onWarn?: (message: string) => void
): string {
  const pairs = [
    { startMarker: MARKER_PACKAGES_START, endMarker: MARKER_PACKAGES_END },
    {
      startMarker: MARKER_PACKAGES_TABLE_START,
      endMarker: MARKER_PACKAGES_TABLE_END,
    },
    {
      startMarker: MARKER_PACKAGE_DETAILS_START,
      endMarker: MARKER_PACKAGE_DETAILS_END,
    },
  ];

  const locations = findMarkers(content, pairs);

  // Anchor collision check — only check headings outside package-details region
  if (packageNames.length > 0 && onWarn !== undefined) {
    const detailsLoc = locations.get(MARKER_PACKAGE_DETAILS_START);
    const contentForHeadingCheck =
      detailsLoc !== undefined
        ? content.substring(0, detailsLoc.startIndex) +
          content.substring(detailsLoc.endIndex)
        : content;

    const headings = parseHeadings(contentForHeadingCheck);
    const slugger = new GithubSlugger();
    const existingSlugs = new Set(headings.map((h) => slugger.slug(h.rawText)));

    for (const pkg of packageNames) {
      if (existingSlugs.has(pkg)) {
        onWarn(
          \`Warning: heading anchor "#\${pkg}" collides with an existing heading in the document — packages-table link may navigate to the wrong section\`
        );
      }
    }
  }

  // Rebuild string by applying injections from end to start so indexes stay valid
  const orderedLocations = [
    { key: MARKER_PACKAGE_DETAILS_START, content: sections.packageDetails },
    { key: MARKER_PACKAGES_TABLE_START, content: sections.packagesTable },
    { key: MARKER_PACKAGES_START, content: sections.packages },
  ];

  let result = content;

  for (const { key, content: sectionContent } of orderedLocations) {
    const loc = locations.get(key);
    if (loc === undefined) continue;

    const before = result.substring(0, loc.startIndex);
    const after = result.substring(loc.endIndex);
    result = \`\${before}\\n\${sectionContent}\\n\${after}\`;
  }

  return result;
}
`,

  // -------------------------------------------------------
  // buildPackagesFlowchart tests — updated for new signature
  // -------------------------------------------------------

  "update-markdown-uml/tests/generators/buildPackagesFlowchart.test.ts": `import { describe, test, expect } from "vitest";
import { buildPackagesFlowchart } from "../../src/generators/buildPackagesFlowchart.js";
import type { ImportEdge } from "../../src/analysis/analyzeImportDependencies.js";

const CLI = "cli";
const REPOSITORY = "repository";
const UTIL = "util";

function edge(from: string, to: string): ImportEdge {
  return { from: from, to: to };
}

describe("buildPackagesFlowchart()", () => {
  test("empty packages produces minimal header", () => {
    const result = buildPackagesFlowchart([], []);
    expect(result).toBe("\`\`\`mermaid\\nflowchart TB\\n\`\`\`");
  });

  test("single package renders subgraph", () => {
    const result = buildPackagesFlowchart([CLI], []);
    expect(result).toContain(\`subgraph \${CLI}["\${CLI}"]\`);
    expect(result).toContain("end");
  });

  test("multiple packages rendered in lexicographic order", () => {
    const result = buildPackagesFlowchart([UTIL, CLI], []);
    const cliPos = result.indexOf(\`subgraph \${CLI}\`);
    const utilPos = result.indexOf(\`subgraph \${UTIL}\`);
    expect(cliPos).toBeLessThan(utilPos);
  });

  test("edge produces arrow between packages", () => {
    const result = buildPackagesFlowchart(
      [CLI, REPOSITORY],
      [edge(CLI, REPOSITORY)]
    );
    expect(result).toContain(\`\${CLI} --> \${REPOSITORY}\`);
  });

  test("no edges produces no arrow lines", () => {
    const result = buildPackagesFlowchart([CLI], []);
    expect(result).not.toContain("-->");
  });

  test("multiple edges rendered in lexicographic order", () => {
    const result = buildPackagesFlowchart(
      [CLI, REPOSITORY, UTIL],
      [edge(REPOSITORY, UTIL), edge(CLI, REPOSITORY), edge(CLI, UTIL)]
    );
    const cliRepoPos = result.indexOf(\`\${CLI} --> \${REPOSITORY}\`);
    const cliUtilPos = result.indexOf(\`\${CLI} --> \${UTIL}\`);
    const repoUtilPos = result.indexOf(\`\${REPOSITORY} --> \${UTIL}\`);
    expect(cliRepoPos).toBeLessThan(cliUtilPos);
    expect(cliUtilPos).toBeLessThan(repoUtilPos);
  });

  test("output is deterministic across repeated calls", () => {
    const edgeList = [edge(CLI, UTIL)];
    const first = buildPackagesFlowchart([CLI, UTIL], edgeList);
    const second = buildPackagesFlowchart([CLI, UTIL], edgeList);
    expect(first).toBe(second);
  });

  test("output is wrapped in mermaid fences", () => {
    const result = buildPackagesFlowchart([CLI], []);
    expect(result).toContain("\`\`\`mermaid");
    expect(result).toContain("\`\`\`");
  });
});
`,
};

for (const [relPath, content] of Object.entries(files)) {
  const fullPath = path.join(ROOT, relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content, "utf-8");
  console.log(`wrote: ${relPath}`);
}

console.log("\ndone. run:");
console.log("  npx nx run @datalackey/update-markdown-uml:test");
