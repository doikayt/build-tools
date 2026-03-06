import { RepositoryRunner } from "../repository/RepositoryRunner.js"
import type { FileProcessor } from "../repository/RepositoryRunner.js"
import type { StandardCliConfig } from "./types.js"

export function runPlugin(
    files: string[],
    processor: FileProcessor<StandardCliConfig>,
    config: StandardCliConfig
): void {

  const isRecursive = files.length > 1

  const policy = {
    isRecursive: isRecursive,
    printPerFileStatus: !config.quiet,
    printSummary: isRecursive && config.verbose,
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