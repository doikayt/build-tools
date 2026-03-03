import type { StandardCliConfig } from "./parseStandardCli.js";

export function validateConfig(
    config: StandardCliConfig
): void {

    if (config.help) return;

    const {
        checkMode,
        verbose,
        quiet,
        mode,
        targetPath
    } = config;

    // quiet + verbose conflict
    if (quiet && verbose) {
        throw new Error("--quiet and --verbose cannot be used together.");
    }

    // --check requires an explicit target
    if (checkMode) {
        const hasExplicitTarget =
            (mode === "single" && targetPath !== null) ||
            (mode === "recursive");

        if (!hasExplicitTarget) {
            throw new Error(
                "--check requires a file argument or --recursive."
            );
        }
    }

    // recursive must always have a path
    if (mode === "recursive" && targetPath === null) {
        throw new Error("--recursive requires a directory argument.");
    }
}