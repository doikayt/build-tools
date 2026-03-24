import fs from "node:fs";
import path from "node:path";

import { generateTOC } from "./generateToc.js";
import type { RunConfig, ProcessingStatus } from "@datalackey/tooling-core";
import { debugLog } from "@datalackey/tooling-core";

export function processFile(filePath: string, config: RunConfig): ProcessingStatus {
    const absolutePath = path.resolve(filePath);

    debugLog(config, `processFile: entry filePath=${absolutePath} runMode=${config.runMode}`);

    let content: string;

    try {
        content = fs.readFileSync(filePath, "utf8");
    } catch {
        throw new Error(`Unable to read markdown file: ${absolutePath}`);
    }

    let updated: string;

    try {
        updated = generateTOC(content);
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);

        if (message === "TOC delimiters not found" && config.mode === "recursive") {
            debugLog(config, `processFile: skipped (no markers) filePath=${absolutePath}`);
            return "skipped";
        }

        throw new Error(`${absolutePath}: ${message}`);
    }

    if (updated === content) {
        debugLog(config, `processFile: unchanged filePath=${absolutePath}`);
        return "unchanged";
    }

    if (config.runMode === "check") {
        debugLog(config, `processFile: stale filePath=${absolutePath}`);
        return "stale";
    }

    fs.writeFileSync(filePath, updated, "utf8");

    debugLog(config, `processFile: updated filePath=${absolutePath}`);
    return "updated";
}
