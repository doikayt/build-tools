import type { CoreConfig } from "../repository/types.js"

export interface ParsedCliResult<TConfig extends CoreConfig = CoreConfig> {
    config: TConfig
    positionals: string[]
    passthrough: string[]
    help: boolean
    version: boolean
}
