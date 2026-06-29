import type { UmlRunConfig } from "./UmlRunConfig.js";

export function validateUmlConfig(config: UmlRunConfig): void {
  if (config.mode === "recursive") {
    throw new Error(
      "--recursive is not supported by update-markdown-uml: UML output " +
        "targets a single markdown file. Pass the target file path directly."
    );
  }
}
