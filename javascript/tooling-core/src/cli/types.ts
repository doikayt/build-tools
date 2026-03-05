import type { RunMode } from "./runMode.js"

export interface StandardCliConfig {
    help: boolean
    version: boolean

    verbose: boolean
    quiet: boolean
    debug: boolean

    runMode: RunMode

    mode: "single" | "recursive"

    recursivePath?: string

    exclude: string[]
}

export interface ParsedCliResult {
    config: StandardCliConfig
    positionals: string[]
    passthrough: string[]
}