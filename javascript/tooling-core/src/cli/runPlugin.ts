import { parseStandardCli } from "./parseStandardCli.js";
import { listFilesToProcess } from "./listFilesToProcess.js";
import {RepositoryRunner, RepositoryStats} from "../repository/RepositoryRunner.js";

import type { ProcessingStatus } from "../repository/types.js";
import { StandardCliConfig } from "./types.js";

export interface PluginOptions {
  argv: string[];
  processor: {
    process(
        filePath: string,
        config: StandardCliConfig
    ): ProcessingStatus;
  };
  printHelp: () => void;
}

export function runPlugin(
    options: PluginOptions
): RepositoryStats {

  const { argv, processor, printHelp } = options;

  const { config, positionals, passthrough } =
      parseStandardCli(argv);

  if (passthrough.length > 0) {
    throw new Error(`Unknown option: ${passthrough[0]}`);
  }
  if (config.help) {
    printHelp();
    return {
      updated: 0,
      unchanged: 0,
      stale: 0,
      skipped: 0
    };
  }

  const resolved =
      listFilesToProcess(config, positionals);
  const runner =
      new RepositoryRunner<StandardCliConfig>({
        processor,
        config
      });
  return runner.runFiles(resolved.files);
}