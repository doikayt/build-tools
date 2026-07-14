import type { FileProcessor, ProcessingStatus } from "@doikayt/tooling-core";
import type { RunConfig } from "@doikayt/tooling-core";
import { processFile } from "./processFile.js";

export class TocFileProcessor implements FileProcessor<RunConfig> {
  process(filePath: string, config: RunConfig): ProcessingStatus {
    return processFile(filePath, config);
  }
}
