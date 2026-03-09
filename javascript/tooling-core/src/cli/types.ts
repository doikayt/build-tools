import type { RunMode } from "./runMode.js"
import type { CoreConfig } from "../repository/types.js"

export interface StandardCliConfig extends CoreConfig {
    help: boolean
    version: boolean
}

export interface ParsedCliResult {
    config: StandardCliConfig
    positionals: string[]
    passthrough: string[]
}
