import type { RunConfig } from "../repository/types.js"

export type RunMode =
  | "update"
  | "check"

export interface PluginOption {
  flag: string
  description: string
  requiresValue?: boolean
  valueName?: string
}

export interface PluginDescriptor<TConfig extends RunConfig = RunConfig> {
  name: string
  description: string
  options: PluginOption[]
  parseOptions?(standard: RunConfig, passthrough: Map<string, string | boolean>): TConfig
  validate?(config: TConfig): void
}

export interface ParsedCliResult<TConfig extends RunConfig = RunConfig> {
    config: TConfig
    positionals: string[]
    passthrough: string[]
    help: boolean
    version: boolean
}
