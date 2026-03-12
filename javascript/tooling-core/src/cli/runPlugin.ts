import { RepositoryRunner } from "../repository/RepositoryRunner.js"
import type { RunConfig } from "../repository/types.js"
import type { FileProcessor } from "../repository/RepositoryRunner.js"
import { createRunnerPolicy } from "../policy/createRunnerPolicy.js"
import { debugLog } from "../logging/debugLog.js"

export function runPlugin<TConfig extends RunConfig>(
    files: string[],
    processor: FileProcessor<TConfig>,
    config: TConfig
) {
    debugLog(config, `runPlugin: fileCount=${files.length}`)

    const policy = createRunnerPolicy(config)
    const runner = new RepositoryRunner({
        processor: processor,
        config: config,
        policy: policy
    })

    return runner.run(files)
}
