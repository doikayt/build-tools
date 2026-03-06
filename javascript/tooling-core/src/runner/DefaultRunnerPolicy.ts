import type { RunnerPolicy, RunnerDecision } from "./RunnerPolicy.js";

export class DefaultRunnerPolicy implements RunnerPolicy {

  handleProcessorError(
    filePath: string,
    error: unknown
  ): RunnerDecision {

    const message =
      error instanceof Error ? error.message : String(error);

    console.error(`ERROR: ${message}`);

    return "abort";
  }

}
