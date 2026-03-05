import type { RunMode } from "../cli/runMode.js";

export type ProcessingStatus =
  | "updated"
  | "unchanged"
  | "stale"
  | "skipped";

export interface OutputPolicyConfig {
  runMode: RunMode;
  verbose: boolean;
  quiet: boolean;
  debug: boolean;
}

export interface FileProcessor<TConfig extends OutputPolicyConfig> {
  process(filePath: string, config: TConfig): ProcessingStatus;
}
