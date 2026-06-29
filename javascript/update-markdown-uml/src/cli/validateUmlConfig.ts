import type { UmlRunConfig } from "./UmlRunConfig.js";

export function validateUmlConfig(config: UmlRunConfig): void {
  if (config.mode === "recursive") {
    throw new Error(
      "--recursive is not supported by update-markdown-uml: component " +
        "discovery is always recursive within a single source tree. " +
        "Run once per source root instead."
    );
  }
}
