import { RepositoryRunner } from "@datalackey/tooling-core";
import { TocFileProcessor } from "./TocFileProcessor.js";

import type { CliConfig } from "../types.js";

export function runSingleFile(
  filePath: string,
  config: CliConfig
): number {

  const runner = new RepositoryRunner({
    processor: new TocFileProcessor(),
    config
  });

  return runner.runFiles([filePath]);
}
