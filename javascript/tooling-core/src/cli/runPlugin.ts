import {RepositoryRunner} from "../repository/RepositoryRunner.js"
import type {FileProcessor} from "../repository/RepositoryRunner.js"
import type {StandardCliConfig} from "./types.js"

export function runPlugin(
    files: string[],
    processor: FileProcessor<StandardCliConfig>,
    config: StandardCliConfig
): void {

    const isRecursive = config.mode === "recursive"

    const policy = {
        isRecursive: isRecursive,
        printPerFileStatus: !config.quiet,
        printSummary: isRecursive,
        continueOnError: isRecursive
    }

    const runner =
        new RepositoryRunner<StandardCliConfig>({
            processor: processor,
            config: config,
            policy: policy
        })

    runner.runFiles(files)
}