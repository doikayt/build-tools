import type { RunMode } from "./runMode.js"
import {CoreConfig} from "../repository/types.js";


export interface StandardCliConfig extends CoreConfig {
    help: boolean
    version: boolean
    recursivePath?: string
    exclude: string[]
}


export interface ParsedCliResult {
    config: StandardCliConfig
    positionals: string[]
    passthrough: string[]
}