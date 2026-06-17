import type { RunConfig } from "@datalackey/tooling-core";

export interface UmlRunConfig extends RunConfig {
  excludeComponents: string[];
  sourceRoot: string | undefined;
  skipTestPatterns: string[];
}
