import { RepositoryRunner } from "../repository/RepositoryRunner.js"
import type { OutputPolicyConfig } from "../repository/types.js"
import type { FileProcessor } from "../repository/RepositoryRunner.js"
import type { RunnerPolicy } from "../policy/RunnerPolicy.js"

export function runPlugin<TConfig extends OutputPolicyConfig>(
    files: string[],
    processor: FileProcessor<TConfig>,
    config: TConfig
) {

    const isRecursiveRun = config.mode === "recursive"

    const policy: RunnerPolicy = {

        onProcessorError(_file: string, error: unknown) {

            const message = error instanceof Error ? error.message : String(error)
            console.error(`ERROR: ${message}`)

            if (isRecursiveRun) {
                return "continue"
            }

            return "abort"
        },

        shouldPrintFileStatus() {
            return true
        },

        shouldPrintSummary() {
            return isRecursiveRun
        }

    }

    const runner = new RepositoryRunner({
        processor: processor,
        config: config,
        policy: policy
    })

    return runner.runFiles(files)
}