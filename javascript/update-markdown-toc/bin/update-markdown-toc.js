#!/usr/bin/env node

import { runCli } from "@datalackey/tooling-core";
import { TocFileProcessor } from "../dist/engine/TocFileProcessor.js";
import { descriptor } from "../dist/cli/descriptor.js";

await runCli({
  descriptor: descriptor,
  processor: new TocFileProcessor(),
});
