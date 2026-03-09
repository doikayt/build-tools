import type { CoreConfig } from "../repository/types.js"

export function validateConfig(
    config: CoreConfig,
    positionals: string[]
): void {
    if (config.verbose && config.quiet) {
        throw new Error("Cannot use --verbose and --quiet together")
    }
}