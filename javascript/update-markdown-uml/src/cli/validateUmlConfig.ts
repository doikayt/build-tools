import fs from "node:fs";
import path from "node:path";
import type { UmlRunConfig } from "./UmlRunConfig.js";

const DEFAULT_SOURCE_ROOT = "src";

export function validateUmlConfig(config: UmlRunConfig): void {
  if (config.mode === "recursive") {
    throw new Error(
      "--recursive is not supported by update-markdown-uml: component " +
        "discovery is always recursive within a single source tree. " +
        "Run once per source root instead."
    );
  }

  if (config.excludeComponents.length === 0) {
    return;
  }

  const resolvedSourceRoot = path.resolve(
    process.cwd(),
    config.sourceRoot ?? DEFAULT_SOURCE_ROOT
  );

  if (!fs.existsSync(resolvedSourceRoot)) {
    return;
  }

  const leafDirs = new Set(
    fs
      .readdirSync(resolvedSourceRoot, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
  );

  for (const excluded of config.excludeComponents) {
    if (!leafDirs.has(excluded)) {
      if (!config.quiet) {
        console.warn(
          `Warning: excluded component "${excluded}" not found under source root "${resolvedSourceRoot}"`
        );
      }
    }
  }
}
