import fs from "node:fs";
import path from "node:path";

import { generateTOC } from "./generateToc.js";
import type { RunConfig } from "@datalackey/tooling-core";

export function processFile(
    filePath: string,
    config: RunConfig
): "updated" | "unchanged" | "stale" | "skipped" {

    const absolutePath = path.resolve(filePath);

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
            return "skipped";
        }

        throw new Error(`${absolutePath}: ${message}`);
    }

    if (updated === content) {
        return "unchanged";
    }

    if (config.runMode === "check") {
        return "stale";
    }

    fs.writeFileSync(filePath, updated, "utf8");

    return "updated";
}