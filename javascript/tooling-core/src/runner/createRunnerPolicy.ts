import type { RunnerPolicy, RunnerDecision } from "../policy/RunnerPolicy.js"
import type { OutputPolicyConfig } from "../repository/types.js"

// TODO: PluginDescriptor will hook in here — custom option definitions, validation,
// and help generation will be driven from a descriptor passed alongside config.

export function createRunnerPolicy(
  config: OutputPolicyConfig
): RunnerPolicy {

  const isRecursiveRun = config.mode === "recursive"

  return {

    onProcessorError(_file: string, error: unknown): RunnerDecision {
      const message = error instanceof Error ? error.message : String(error)
      console.error(`ERROR: ${message}`)
      return isRecursiveRun ? "continue" : "abort"
    },

    shouldPrintFileStatus(): boolean {
      return true
    },

    shouldPrintSummary(): boolean {
      return isRecursiveRun
    }

  }
}
