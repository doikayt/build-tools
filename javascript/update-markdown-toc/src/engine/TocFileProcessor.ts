import type { FileProcessor } from "@datalackey/tooling-core";
import type { CliConfig } from "../types.js";
import { processFile } from "./processFile.js";

export class TocFileProcessor
    implements FileProcessor<CliConfig>
{
  process(filePath: string, config: CliConfig) {
    return processFile(filePath, config);
  }
}