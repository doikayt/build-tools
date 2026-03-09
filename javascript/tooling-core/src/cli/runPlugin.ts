import { RepositoryRunner } from "../repository/RepositoryRunner.js"
import type { CoreConfig } from "../repository/types.js"
import type { FileProcessor } from "../repository/RepositoryRunner.js"
import { createRunnerPolicy } from "../runner/createRunnerPolicy.js"

export function runPlugin<TConfig extends CoreConfig>(
    files: string[],
    processor: FileProcessor<TConfig>,
    config: TConfig
) {
    const policy = createRunnerPolicy(config)

    const runner = new RepositoryRunner({
        processor: processor,
        config: config,
        policy: policy
    })

    return runner.runFiles(files)
}
