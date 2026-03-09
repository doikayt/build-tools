import type { RunConfig } from "../repository/types.js"

export interface ParsedCliResult<TConfig extends RunConfig = RunConfig> {
    config: TConfig
    positionals: string[]
    passthrough: string[]
    help: boolean
    version: boolean
}
