import fs from "node:fs";
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
    debugLog(config, `UmlFileProcessor: entry filePath=${filePath}`);

    const sourceRoot = resolveSourceRoot(filePath, config.sourceRoot);
    debugLog(config, `UmlFileProcessor: sourceRoot=${sourceRoot}`);

    const rawPatterns = config.skipTestPatterns as string[] | undefined;
    const skipPatterns: string[] =
      rawPatterns !== undefined && rawPatterns.length > 0
        ? rawPatterns
        : DEFAULT_SKIP_TEST_PATTERNS;

    // 1. Discover leaf components
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

    // 2. Read component descriptions
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

    // 4. Build flowchart (compact — component names only, no type enumeration)
    const componentsContent = buildPackagesFlowchart(activeLeafNames, edges);

    // 5. Build components table
    const componentsTableContent = buildPackagesTable(
      activeLeafNames,
      descriptions
    );

    // 6. Build per-component class diagrams
    const detailSections = activeLeafDirs.map((leafDir) => {
      const name = path.basename(leafDir);
      const diagram = buildPackageClassDiagram(leafDir);
      return `#### ${name}\n${diagram}`;
    });
    const componentDetailsContent = detailSections.join("\n\n");

    // 7. Inject into markdown file
    const original = fs.readFileSync(filePath, "utf-8");

    const updated = injectUmlSections(
      original,
      {
        components: componentsContent,
        componentsTable: componentsTableContent,
        componentDetails: componentDetailsContent,
      },
      activeLeafNames,
      onWarn
    );

    // 8. Compare and return status
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
