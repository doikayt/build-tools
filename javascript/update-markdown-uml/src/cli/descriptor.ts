import type { PluginDescriptor } from "@datalackey/tooling-core";
import type { UmlRunConfig } from "./UmlRunConfig.js";
import { parseUmlOptions } from "./parseUmlOptions.js";
import { validateUmlConfig } from "./validateUmlConfig.js";

export const descriptor: PluginDescriptor<UmlRunConfig> = {
  name: "update-markdown-uml",
  description:
    "Generate and validate UML class and component diagrams for TypeScript source trees",
  options: [
    {
      flag: "--exclude-components",
      description:
        "Leaf component directory names to exclude from diagram generation",
      requiresValue: true,
      valueName: "pkg1,pkg2,...",
    },
    {
      flag: "--source",
      description: "Override source root discovery (default: src/)",
      requiresValue: true,
      valueName: "path",
    },
    {
      flag: "--test-patterns-to-skip",
      description:
        "Glob patterns (comma-separated) for test files to exclude from component discovery",
      requiresValue: true,
      valueName: "pat1,pat2,...",
    },
    {
      flag: "-t",
      description: "Short form of --test-patterns-to-skip",
      requiresValue: true,
      valueName: "pat1,pat2,...",
    },
  ],
  parseOptions: parseUmlOptions,
  validate: validateUmlConfig,
};
