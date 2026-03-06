export type RunnerDecision =
  | "abort"
  | "continue";

export interface RunnerPolicy {
  handleProcessorError(
    filePath: string,
    error: unknown
  ): RunnerDecision;
}
