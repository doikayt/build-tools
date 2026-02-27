import fs from "fs";
import path from "path";
import { generateTOC } from "./generateToc.js";

export function processFile(filePath, config) {
    const { checkMode, isRecursive } = config;

    let content;

    try {
        content = fs.readFileSync(filePath, "utf8");
    } catch {
        const absolutePath = path.resolve(filePath);
        throw new Error(`Unable to read markdown file: ${absolutePath}`);
    }

    let updated;

    try {
        updated = generateTOC(content);
    } catch (err) {
        if (err.message === "TOC delimiters not found" && isRecursive) {
            return { status: "skipped" };
        }

        const absolutePath = path.resolve(filePath);
        throw new Error(`${absolutePath}: ${err.message}`);
    }

    if (updated === content) {
        return { status: "unchanged" };
    }

    if (checkMode) {
        return { status: "stale" };
    }

    fs.writeFileSync(filePath, updated, "utf8");
    return { status: "updated" };
}
