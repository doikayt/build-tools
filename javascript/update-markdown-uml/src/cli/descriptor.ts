import type { PluginDescriptor } from "@datalackey/tooling-core"
import type { UmlRunConfig } from "./UmlRunConfig.js"
import { parseUmlOptions } from "./parseUmlOptions.js"
import { validateUmlConfig } from "./validateUmlConfig.js"

export const descriptor: PluginDescriptor<UmlRunConfig> = {
  name: "update-markdown-uml",
  description: "Generate and validate UML class and package diagrams for TypeScript source trees",
  options: [
    {
      flag: "--exclude-packages",
      description: "Comma-separated list of leaf package directory names to exclude from diagram generation",
      requiresValue: true,
      valueName: "packages"
    },
    {
      flag: "--source",
      description: "Override source root discovery (default: src/)",
      requiresValue: true,
      valueName: "path"
    }
  ],
  parseOptions: parseUmlOptions,
  validate: validateUmlConfig
}
