import type { RunConfig } from "@datalackey/tooling-core"
import type { UmlRunConfig } from "./UmlRunConfig.js"

export function parseUmlOptions(
  standard: RunConfig,
  passthrough: Map<string, string | boolean>
): UmlRunConfig {

  const rawExclude = passthrough.get("--exclude-packages")
  const excludePackages: string[] =
    typeof rawExclude === "string" && rawExclude.length > 0
      ? rawExclude.split(",").map((s) => s.trim()).filter((s) => s.length > 0)
      : []

  const rawSource = passthrough.get("--source")
  const sourceRoot: string | undefined =
    typeof rawSource === "string" ? rawSource : undefined

  return {
    ...standard,
    excludePackages: excludePackages,
    sourceRoot: sourceRoot
  }
}
