import type { FileProcessor } from "@datalackey/tooling-core";
import type { RunConfig } from "@datalackey/tooling-core";
import { processFile } from "./processFile.js";

export class TocFileProcessor
    implements FileProcessor<RunConfig>
{
  process(filePath: string, config: RunConfig) {
    return processFile(filePath, config);
  }
}