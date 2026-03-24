import type { RunConfig } from "@datalackey/tooling-core";

export interface UmlRunConfig extends RunConfig {
  excludePackages: string[];
  sourceRoot: string | undefined;
}
