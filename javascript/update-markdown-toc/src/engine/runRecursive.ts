import { processFile } from "./processFile.js";
import { printStatus } from "./printStatus.js";
import { walkFiles } from "@datalackey/tooling-core";

import type { CliConfig } from "../types.js";

export function runRecursive(
    rootDir: string,
    config: CliConfig
): number {

    const files = walkFiles({
        rootDir,
        extensions: [".md"],
        excludeDirs: config.excludeList ?? undefined
    }).sort();   // ensure deterministic order

    let staleFound = false;

    for (const file of files) {
        try {
            const result = processFile(file, config);

            if (config.checkMode && result.status === "stale") {
                staleFound = true;
            }

            printStatus(result.status, file, config);

        } catch (err: unknown) {
            const message =
                err instanceof Error ? err.message : String(err);

            console.error(`ERROR: ${message}`);
            return 1;
        }
    }

    if (config.checkMode && staleFound) return 1;
    return 0;
}