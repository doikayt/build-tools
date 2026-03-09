import type { RunMode } from "../cli/runMode.js";



export interface FileProcessor<TConfig extends CoreConfig> {
  process(filePath: string, config: TConfig): ProcessingStatus;
}

export interface CoreConfig {
  runMode: RunMode;
  mode: "single" | "recursive";
  recursivePath?: string;
  exclude: string[];
  verbose: boolean;
  quiet: boolean;
  debug: boolean;
}

export type ProcessingStatus =
    | "updated"
    | "unchanged"
    | "stale"
    | "skipped";
