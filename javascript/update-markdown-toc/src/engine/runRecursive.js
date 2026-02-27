import { processFile } from "./processFile.js";
import { printStatus } from "./printStatus.js";
import { walkFiles } from "@datalackey/tooling-core";

export function runRecursive(rootDir, config) {

    const files = walkFiles({
        rootDir,
        extensions: [".md"],
        excludeDirs: config.excludeList ?? undefined
    });

    let staleFound = false;

    for (const file of files) {
        try {
            const result = processFile(file, config);

            if (config.checkMode && result.status === "stale") {
                staleFound = true;
            }

            printStatus(result.status, file, config);

        } catch (err) {
            console.error(`ERROR: ${err.message}`);
            return 1;
        }
    }

    if (config.checkMode && staleFound) return 1;
    return 0;
}
