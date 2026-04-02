import fs from "node:fs";
import path from "node:path";
import type { FileProcessor, ProcessingStatus } from "@datalackey/tooling-core";
import { debugLog } from "@datalackey/tooling-core";
import type { UmlRunConfig } from "../cli/UmlRunConfig.js";
import { discoverLeafPackages } from "../discovery/discoverLeafPackages.js";
import { readPackageDescription } from "../discovery/readPackageDescription.js";
import { analyzeImportDependencies } from "../analysis/analyzeImportDependencies.js";
import { extractTypeNames } from "../analysis/extractTypeNames.js";
import { buildPackagesFlowchart } from "../generators/buildPackagesFlowchart.js";
import { buildPackagesTable } from "../generators/buildPackagesTable.js";
import { buildPackageClassDiagram } from "../generators/buildPackageClassDiagram.js";
import { injectUmlSections } from "../markdown/injectUmlSections.js";
import { resolveSourceRoot } from "./resolveSourceRoot.js";

const DEFAULT_SKIP_TEST_PATTERNS = ["*.test.ts", "*.spec.ts"];

export class UmlFileProcessor implements FileProcessor<UmlRunConfig> {
  process(filePath: string, config: UmlRunConfig): ProcessingStatus {
    debugLog(config, `UmlFileProcessor: entry filePath=${filePath}`);

    const sourceRoot = resolveSourceRoot(filePath, config.sourceRoot);
    debugLog(config, `UmlFileProcessor: sourceRoot=${sourceRoot}`);

    const rawPatterns = config.skipTestPatterns as string[] | undefined;
    const skipPatterns: string[] =
      rawPatterns !== undefined && rawPatterns.length > 0
        ? rawPatterns
        : DEFAULT_SKIP_TEST_PATTERNS;

    // 1. Discover leaf packages
    const leafDirs = discoverLeafPackages(sourceRoot, skipPatterns);
    debugLog(config, `UmlFileProcessor: leafDirs=${JSON.stringify(leafDirs)}`);

    const leafNames = leafDirs.map((d) => path.basename(d));

    // Warn about excluded packages not found
    for (const excluded of config.excludePackages) {
      if (!leafNames.includes(excluded)) {
        if (!config.quiet) {
          console.warn(
            `Warning: excluded package "${excluded}" not found under source root "${sourceRoot}"`
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
    debugLog(config, `UmlFileProcessor: edges=${JSON.stringify(edges)}`);

    // 4. Extract type names per leaf
    const typesByPackage = new Map<string, string[]>();
    for (const leafDir of activeLeafDirs) {
      const name = path.basename(leafDir);
      typesByPackage.set(name, extractTypeNames(leafDir));
    }

    // 5. Build flowchart
    const packagesContent = buildPackagesFlowchart(
      activeLeafNames,
      typesByPackage,
      edges
    );

    // 6. Build packages table
    const packagesTableContent = buildPackagesTable(
      activeLeafNames,
      descriptions
    );

    // 7. Build per-package class diagrams
    const detailSections = activeLeafDirs.map((leafDir) => {
      const name = path.basename(leafDir);
      const diagram = buildPackageClassDiagram(leafDir);
      return `#### ${name}\n${diagram}`;
    });
    const packageDetailsContent = detailSections.join("\n\n");

    // 8. Inject into markdown file
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

    // 9. Compare and return status
    if (updated === original) {
      debugLog(config, `UmlFileProcessor: unchanged filePath=${filePath}`);
      return "unchanged";
    }

    if (config.runMode === "check") {
      debugLog(config, `UmlFileProcessor: needsUpdate filePath=${filePath}`);
      return "needsUpdate";
    }

    fs.writeFileSync(filePath, updated, "utf-8");
    debugLog(config, `UmlFileProcessor: updated filePath=${filePath}`);
    return "updated";
  }
}
