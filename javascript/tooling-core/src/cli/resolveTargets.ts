import fs from "node:fs";
import path from "node:path";
import { walkFiles } from "../fs/walkFiles.js";
import type { StandardCliConfig } from "./parseStandardCli.js";

export type ResolvedTargets =
    | { mode: "single"; files: string[] }
    | { mode: "recursive"; files: string[] };

export function resolveTargets(
    config: StandardCliConfig
): ResolvedTargets {

    if (config.help) {
        return { mode: "single", files: [] };
    }

    const cwd = process.cwd();

    // ------------------------------------------------------------
    // SINGLE MODE
    // ------------------------------------------------------------

    if (config.mode === "single") {

        const target = config.targetPath ?? "README.md";
        const resolved = path.resolve(cwd, target);

        if (!fs.existsSync(resolved)) {
            throw new Error(`File does not exist: ${resolved}`);
        }

        const stat = fs.statSync(resolved);

        if (!stat.isFile()) {
            throw new Error(`Not a file: ${resolved}`);
        }

        return {
            mode: "single",
            files: [resolved]
        };
    }

    // ------------------------------------------------------------
    // RECURSIVE MODE
    // ------------------------------------------------------------

    const resolvedRoot = path.resolve(cwd, config.targetPath!);

    if (!fs.existsSync(resolvedRoot)) {
        throw new Error(`Recursive path does not exist: ${resolvedRoot}`);
    }

    const stat = fs.statSync(resolvedRoot);

    if (!stat.isDirectory()) {
        throw new Error(`--recursive requires a directory: ${resolvedRoot}`);
    }

    const files = walkFiles({
        rootDir: resolvedRoot,
        extensions: [".md"],
        excludeDirs: config.excludeList ?? undefined
    });

    return {
        mode: "recursive",
        files
    };
}