import type { RunnerPolicy, RunnerDecision } from "./RunnerPolicy.js"

export class RecursiveRunnerPolicy implements RunnerPolicy {

  onProcessorError(file: string, error: unknown): RunnerDecision {
    const message = error instanceof Error ? error.message : String(error)
    console.error(`ERROR: ${message}`)
    return "continue"
  }

  shouldPrintFileStatus(): boolean {
    return true
  }

  shouldPrintSummary(): boolean {
    return true
  }

}
