import type { ProcessingStatus } from "../repository/types.js"

export type RunnerDecision = "abort" | "continue"

export interface RunnerPolicy {
    shouldPrint(status: ProcessingStatus): boolean
    shouldPrintSummary(): boolean
    handleProcessorError(file: string, error: unknown): RunnerDecision
}
