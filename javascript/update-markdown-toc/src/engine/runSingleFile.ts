import { processFile } from "./processFile.js";
import { printStatus } from "./printStatus.js";

import type { CliConfig } from "../types.js";

export function runSingleFile(
    filePath: string,
    config: CliConfig
): number {
    const result = processFile(filePath, config);

    if (config.checkMode && result.status === "stale") {
        if (config.verbose && !config.quiet) {
            console.log(`Stale: ${filePath}`);
        }
        return 1;
    }

    printStatus(result.status, filePath, config);

    return 0;
}
