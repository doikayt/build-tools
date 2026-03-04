import type { StandardCliConfig } from "./types.js"

export function validateConfig(
    config: StandardCliConfig,
    positionals: string[]
): void {
    if (config.verbose && config.quiet) {
        throw new Error("Cannot use --verbose and --quiet together")
    }
}