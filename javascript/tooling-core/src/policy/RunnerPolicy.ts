export type RunnerDecision = "continue" | "abort"

export interface RunnerPolicy {

  onProcessorError(file: string, error: unknown): RunnerDecision

  shouldPrintFileStatus(): boolean

  shouldPrintSummary(): boolean

}
