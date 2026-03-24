import type { RunnerPolicy, RunnerDecision } from "./RunnerPolicy.js";
import type { RunConfig, ProcessingStatus } from "../repository/types.js";
import { debugLog } from "../logging/debugLog.js";

export function createRunnerPolicy(config: RunConfig): RunnerPolicy {
    const isRecursiveRun = config.mode === "recursive";

    return {
        shouldPrint(status: ProcessingStatus): boolean {
            if (config.quiet) {
                debugLog(config, `policy.shouldPrint: false (quiet) status=${status}`);
                return false;
            }
            if (status === "updated" || status === "stale") {
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
            debugLog(config, `policy.shouldPrintSummary: ${isRecursiveRun}`);
            return isRecursiveRun;
        },

        handleProcessorError(_file: string, error: unknown): RunnerDecision {
            const message = error instanceof Error ? error.message : String(error);
            console.error(`ERROR: ${message}`);
            const decision: RunnerDecision = isRecursiveRun ? "continue" : "abort";
            debugLog(config, `policy.handleProcessorError: decision=${decision} error=${message}`);
            return decision;
        },
    };
}
