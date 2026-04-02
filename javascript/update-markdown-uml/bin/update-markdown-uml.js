#!/usr/bin/env node
import { runCli } from "@datalackey/tooling-core";
import { descriptor } from "../dist/cli/descriptor.js";
import { UmlFileProcessor } from "../dist/processor/UmlFileProcessor.js";

await runCli({
  descriptor: descriptor,
  processor: new UmlFileProcessor(),
});
