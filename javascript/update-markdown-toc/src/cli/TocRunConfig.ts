import type { RunConfig } from "@datalackey/tooling-core";

export interface TocRunConfig extends RunConfig {
  validateExternalLinksLocal: boolean;
  linkTimeoutMsLocal: number;
}
