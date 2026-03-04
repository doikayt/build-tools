#!/usr/bin/env node

import {
  parseStandardCli,
  resolveTargets
} from "@datalackey/tooling-core";

import { RepositoryRunner } from "@datalackey/tooling-core";
import { TocFileProcessor } from "../dist/engine/TocFileProcessor.js";

function printHelp() {
  console.log(`
update-markdown-toc [options] [file]

Options:
  -c, --check
  -r, --recursive <path>
  -e, --exclude <dir1,dir2,...>
  -v, --verbose
  -q, --quiet
  -d, --debug
  -h, --help
`);
}

try {
  const { config, positionals, passthrough } =
      parseStandardCli(process.argv.slice(2));

  if (passthrough.length > 0) {
    throw new Error(`Unknown option: ${passthrough[0]}`);
  }

  if (config.help) {
    printHelp();
    process.exit(0);
  }

  const resolved = resolveTargets(config, positionals);

  const runner = new RepositoryRunner({
    processor: new TocFileProcessor(),
    config: config
  });

  process.exit(runner.runFiles(resolved.files));

} catch (err) {
  const message =
      err instanceof Error ? err.message : String(err);
  console.error(`ERROR: ${message}`);
  process.exit(1);
}