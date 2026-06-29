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
      const shouldPrint = config.verbose;
      debugLog(config, `policy.shouldPrint: ${shouldPrint} status=${status}`);
      return shouldPrint;
    },

    shouldPrintSummary(): boolean {
      if (config.quiet) {
        debugLog(config, `policy.shouldPrintSummary: false (quiet)`);
        return false;
      }
      const shouldPrint = isRecursiveRun && config.verbose;
      debugLog(config, `policy.shouldPrintSummary: ${shouldPrint}`);
      return shouldPrint;
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
