import { RepositoryRunner } from "../repository/RepositoryRunner.js";
import type { RunConfig, FileProcessor } from "../repository/types.js";
import { createRunnerPolicy } from "../policy/createRunnerPolicy.js";
import { debugLog } from "../util/debugLog.js";
import type { RepositoryStats } from "../repository/RepositoryRunner.js";

export function runPlugin<TConfig extends RunConfig>(
  files: string[],
  processor: FileProcessor<TConfig>,
  config: TConfig
): RepositoryStats {
  debugLog(config, `runPlugin: fileCount=${files.length}`);

  const policy = createRunnerPolicy(config);
  const runner = new RepositoryRunner({
    processor: processor,
    config: config,
    policy: policy,
  });

  return runner.run(files);
}
