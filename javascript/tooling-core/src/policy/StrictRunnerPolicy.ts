import type { RunnerPolicy, RunnerDecision } from "./RunnerPolicy.js"

export class StrictRunnerPolicy implements RunnerPolicy {

  onProcessorError(): RunnerDecision {
    return "abort"
  }

  shouldPrintFileStatus(): boolean {
    return true
  }

  shouldPrintSummary(): boolean {
    return true
  }

}
