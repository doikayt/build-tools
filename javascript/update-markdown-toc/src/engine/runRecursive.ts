import { walkFiles, RepositoryRunner } from "@datalackey/tooling-core";
import { TocFileProcessor } from "./TocFileProcessor.js";

import type { CliConfig } from "../types.js";

export function runRecursive(
    rootDir: string,
    config: CliConfig
): number {

  const files = walkFiles({
    rootDir,
    extensions: [".md"],
    excludeDirs: config.excludeList ?? undefined
  }).sort();

  const runner = new RepositoryRunner({
    processor: new TocFileProcessor(),
    config
  });

  return runner.runFiles(files);
}