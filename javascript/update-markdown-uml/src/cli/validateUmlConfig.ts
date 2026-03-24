import fs from "node:fs";
import path from "node:path";
import type { UmlRunConfig } from "./UmlRunConfig.js";

const DEFAULT_SOURCE_ROOT = "src";

export function validateUmlConfig(config: UmlRunConfig): void {
    if (config.excludePackages.length === 0) {
        return;
    }

    const resolvedSourceRoot = path.resolve(
        process.cwd(),
        config.sourceRoot ?? DEFAULT_SOURCE_ROOT
    );

    if (!fs.existsSync(resolvedSourceRoot)) {
        return;
    }

    const leafDirs = new Set(
        fs
            .readdirSync(resolvedSourceRoot, { withFileTypes: true })
            .filter(entry => entry.isDirectory())
            .map(entry => entry.name)
    );

    for (const excluded of config.excludePackages) {
        if (!leafDirs.has(excluded)) {
            if (!config.quiet) {
                console.log(
                    `Warning: excluded package "${excluded}" not found under source root "${resolvedSourceRoot}"`
                );
            }
        }
    }
}
