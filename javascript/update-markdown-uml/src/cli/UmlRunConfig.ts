import type { RunConfig } from "@doikayt/tooling-core";

export interface UmlRunConfig extends RunConfig {
  excludeComponents: string[];
  sourceRoot: string | undefined;
  skipTestPatterns: string[];
}
