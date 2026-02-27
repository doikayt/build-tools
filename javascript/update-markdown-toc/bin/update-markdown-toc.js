#!/usr/bin/env node

import { resolve } from "node:path";
import { existsSync, statSync } from "node:fs";

import { parseCli } from "../dist/cli/parseCli.js";
import { runSingleFile, runRecursive } from "../dist/index.js";

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
    const config = parseCli(process.argv.slice(2));

    if (config.help) {
        printHelp();
        process.exit(0);
    }

    if (config.isRecursive) {
        const resolved = resolve(process.cwd(), config.recursivePath);

        if (!existsSync(resolved)) {
            console.error("ERROR: Recursive path does not exist");
            process.exit(1);
        }

        if (!statSync(resolved).isDirectory()) {
            console.error("ERROR: --recursive requires a directory");
            process.exit(1);
        }

        process.exit(runRecursive(resolved, config));
    }

    const resolved = resolve(
        process.cwd(),
        config.targetFile || "README.md"
    );

    process.exit(runSingleFile(resolved, config));

} catch (err) {
    console.error(`ERROR: ${err.message}`);
    process.exit(1);
}
