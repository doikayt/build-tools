import type { RunMode } from "../cli/types.js";



export interface FileProcessor<TConfig extends RunConfig> {
  process(filePath: string, config: TConfig): ProcessingStatus;
}

export interface RunConfig {
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
