import {RepositoryRunner} from "../repository/RepositoryRunner.js"
import type {FileProcessor} from "../repository/RepositoryRunner.js"
import type {StandardCliConfig} from "./types.js"
import { createRunnerPolicy } from "../runner/createRunnerPolicy.js"

export function runPlugin(
    files: string[],
    processor: FileProcessor<StandardCliConfig>,
    config: StandardCliConfig
): void {

    const policy = createRunnerPolicy(config)

    const runner =
        new RepositoryRunner<StandardCliConfig>({
            processor: processor,
            config: config,
            policy: policy
        })

    runner.runFiles(files)
}
