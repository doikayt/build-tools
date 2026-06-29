import type { RunnerPolicy, RunnerDecision } from "./RunnerPolicy.js";
import type { RunConfig, ProcessingStatus } from "../repository/types.js";
import { debugLog } from "../util/debugLog.js";
import { toErrorMessage } from "../util/toErrorMessage.js";

export function createRunnerPolicy(config: RunConfig): RunnerPolicy {
  const isRecursiveRun = config.mode === "recursive";

  return {
    shouldPrint(status: ProcessingStatus): boolean {
      if (config.quiet) {
        debugLog(config, `policy.shouldPrint: false (quiet) status=${status}`);
        return false;
      }
      if (status === "updated" || status === "needsUpdate") {
        debugLog(config, `policy.shouldPrint: true status=${status}`);
        return true;
      }
      const result = config.verbose;
      debugLog(config, `policy.shouldPrint: ${result} status=${status}`);
      return result;
    },

    shouldPrintSummary(): boolean {
      if (config.quiet) {
        debugLog(config, `policy.shouldPrintSummary: false (quiet)`);
        return false;
      }
      const result = isRecursiveRun && config.verbose;
      debugLog(config, `policy.shouldPrintSummary: ${result}`);
      return result;
    },

    handleProcessorError(_file: string, error: unknown): RunnerDecision {
      const message = toErrorMessage(error);
      console.error(`ERROR: ${message}`);
      const decision: RunnerDecision = isRecursiveRun ? "continue" : "abort";
      debugLog(
        config,
        `policy.handleProcessorError: decision=${decision} error=${message}`
      );
      return decision;
    },
  };
}
