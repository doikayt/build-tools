export type ProcessingStatus =
  | "updated"
  | "unchanged"
  | "stale"
  | "skipped";

export interface OutputPolicyConfig {
  checkMode: boolean;
  verbose: boolean;
  quiet: boolean;
  debug: boolean;
}

export interface FileProcessor<TConfig extends OutputPolicyConfig> {
  process(filePath: string, config: TConfig): ProcessingStatus;
}
