import fs from "node:fs";
import path from "node:path";

export const DEFAULT_EXCLUDE_DIRS: readonly string[] = ["node_modules"];

export interface WalkOptions {
    rootDir: string;
    extensions?: string[];
    excludeDirs?: string[];
}

/**
 * Deterministic filesystem walker.
 *
 * Guarantees:
 * - Lexicographically sorted directory traversal
 * - Lexicographically sorted final result
 * - Deterministic behavior across repeated runs
 *
 * Default behavior:
 * - Uses DEFAULT_EXCLUDE_DIRS unless over-ride provided
 */
export function walkFiles(options: WalkOptions): string[] {
    const rootDir = options.rootDir;
    const extensions = options.extensions;
    const excludeDirs = options.excludeDirs ?? DEFAULT_EXCLUDE_DIRS;

    const results: string[] = [];

    function walk(currentDir: string): void {
        const entries = fs
            .readdirSync(currentDir, { withFileTypes: true })
            .sort((a, b) => a.name.localeCompare(b.name));

        for (const entry of entries) {
            const fullPath = path.join(currentDir, entry.name);
            if (entry.isDirectory()) {
                if (excludeDirs.includes(entry.name)) {
                    continue;
                }
                walk(fullPath);
            } else if (entry.isFile()) {
                if (!extensions || extensions.length === 0) {
                    results.push(fullPath);
                } else {
                    for (const ext of extensions) {
                        if (entry.name.endsWith(ext)) {
                            results.push(fullPath);
                            break;
                        }
                    }
                }
            }
        }
    }

    walk(rootDir);
    return results.sort((a, b) => a.localeCompare(b));
}
