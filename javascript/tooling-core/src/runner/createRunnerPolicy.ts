import type { RunnerPolicy, RunnerDecision } from "../policy/RunnerPolicy.js"
import type { RunConfig, ProcessingStatus } from "../repository/types.js"

// TODO: PluginDescriptor will hook in here — custom option definitions, validation,
// and help generation will be driven from a descriptor passed alongside config.

export function createRunnerPolicy(config: RunConfig): RunnerPolicy {

    const isRecursiveRun = config.mode === "recursive"

    return {

        shouldPrint(status: ProcessingStatus): boolean {
            if (config.quiet) return false
            if (status === "updated" || status === "stale") return true
            return config.verbose
        },

        shouldPrintSummary(): boolean {
            if (config.quiet) return false
            return isRecursiveRun
        },

        handleProcessorError(_file: string, error: unknown): RunnerDecision {
            const message = error instanceof Error ? error.message : String(error)
            console.error(`ERROR: ${message}`)
            return isRecursiveRun ? "continue" : "abort"
        }
    }
}
