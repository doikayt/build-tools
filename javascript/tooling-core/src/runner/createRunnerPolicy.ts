import type { RunnerPolicy } from "../repository/types.js"
import type { StandardCliConfig } from "../cli/types.js"

export function createRunnerPolicy(
  config: StandardCliConfig
): RunnerPolicy {

  const recursive = config.mode === "recursive"

  return {
    isRecursive: recursive,
    printPerFileStatus: !config.quiet,
    printSummary: recursive,
    continueOnError: recursive
  }
}
