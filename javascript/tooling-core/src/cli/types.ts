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

export interface PluginDescriptor {
  name: string
  description: string
  options: PluginOption[]
  validate?(config: unknown): void
}

export interface ParsedCliResult<TConfig extends RunConfig = RunConfig> {
    config: TConfig
    positionals: string[]
    passthrough: string[]
    help: boolean
    version: boolean
}
