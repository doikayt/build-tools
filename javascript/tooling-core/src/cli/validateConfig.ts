import type { RunConfig } from "../repository/types.js"

export function validateConfig(
    config: RunConfig,
    positionals: string[]
): void {
    if (config.verbose && config.quiet) {
        throw new Error("Cannot use --verbose and --quiet together")
    }
}