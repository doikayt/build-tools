export interface StandardCliConfig {
    help: boolean
    version: boolean

    verbose: boolean
    quiet: boolean
    debug: boolean

    checkMode: boolean

    mode: "single" | "recursive"

    recursivePath?: string

    exclude: string[]
}

export interface ParsedCliResult {
    config: StandardCliConfig
    positionals: string[]
    passthrough: string[]
}