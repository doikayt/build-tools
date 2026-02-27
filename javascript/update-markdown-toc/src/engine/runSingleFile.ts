import { processFile } from "./processFile.js";
import { printStatus } from "./printStatus.js";
export function runSingleFile(filePath, config) {
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
