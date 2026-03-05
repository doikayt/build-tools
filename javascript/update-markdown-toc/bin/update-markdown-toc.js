#!/usr/bin/env node

import { runPlugin } from "@datalackey/tooling-core";
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

  const exitCode = runPlugin({
    argv: process.argv.slice(2),
    processor: new TocFileProcessor(),
    printHelp
  });

  process.exit(exitCode);

} catch (err) {

  const message =
    err instanceof Error ? err.message : String(err);

  console.error(`ERROR: ${message}`);
  process.exit(1);

}
