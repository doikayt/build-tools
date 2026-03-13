import type { RunConfig } from "../repository/types.js"
import type { PluginOption } from "./types.js"
import type { ParsedCliResult } from "./types.js"
import { debugLog } from "../logging/debugLog.js"

const DEFAULT_LINK_TIMEOUT_MS = 3000

export function validateConfig(
  config: RunConfig,
  _positionals: string[]
): void {
  if (config.verbose && config.quiet) {
    throw new Error("Cannot use --verbose and --quiet together")
  }
}

export function parseStandardCli(argv: string[]): ParsedCliResult<RunConfig> {

  const args = argv

  let help = false
  let version = false
  let verbose = false
  let quiet = false
  let debug = false
  let runMode: "update" | "check" = "update"
  let mode: "single" | "recursive" = "single"
  let recursivePath: string | undefined = undefined
  let exclude: string[] = []
  let validateExternalLinks = true
  let linkTimeoutMs = DEFAULT_LINK_TIMEOUT_MS

  const positionals: string[] = []
  const passthrough: string[] = []

  for (let i = 0; i < args.length; i++) {

    const arg = args[i]

    switch (arg) {

      case "-h":
      case "--help":
        help = true
        continue

      case "--version":
        version = true
        continue

      case "-v":
      case "--verbose":
        verbose = true
        continue

      case "-q":
      case "--quiet":
        quiet = true
        continue

      case "-d":
      case "--debug":
        debug = true
        continue

      case "-c":
      case "--check":
        runMode = "check"
        continue

      case "-n":
      case "--no-external-link-check":
        validateExternalLinks = false
        continue

      case "-l":
      case "--link-timeout-ms": {
        const next = args[i + 1]
        if (next === undefined || next.startsWith("-")) {
          throw new Error("--link-timeout-ms requires a numeric value")
        }
        const parsed = Number(next)
        if (isNaN(parsed)) {
          throw new Error("--link-timeout-ms requires a numeric value")
        }
        linkTimeoutMs = parsed
        i++
        continue
      }

      case "-r":
      case "--recursive": {
        const next = args[i + 1]
        if (next === undefined || next.startsWith("-")) {
          throw new Error("--recursive requires a path")
        }
        mode = "recursive"
        recursivePath = next
        i++
        continue
      }

      case "-e":
      case "--exclude": {
        const next = args[i + 1]
        if (next === undefined) {
          throw new Error("--exclude requires a comma-separated list (or empty string)")
        }
        if (next !== "" && next.startsWith("-")) {
          throw new Error("--exclude requires a comma-separated list (or empty string)")
        }
        exclude = next === ""
            ? []
            : next.split(",").map((s) => s.trim()).filter((s) => s.length > 0)
        i++
        continue
      }

      default:
        if (arg.startsWith("-")) {
          passthrough.push(arg)
          continue
        }
        positionals.push(arg)
    }
  }

  if (!help && !version) {
    if (verbose && quiet) {
      throw new Error("Cannot use --verbose and --quiet together")
    }
  }

  const config: RunConfig = {
    runMode: runMode,
    mode: mode,
    recursivePath: recursivePath,
    exclude: exclude,
    verbose: verbose,
    quiet: quiet,
    debug: debug,
    validateExternalLinks: validateExternalLinks,
    linkTimeoutMs: linkTimeoutMs
  }

  validateConfig(config, positionals)

  let retval = {
        config: config,
        positionals: positionals,
        passthrough: passthrough,
        help: help,
        version: version
    };
    debugLog(config, `parseStandardCli: result=${retval}`)
    return retval

}

export function buildPassthroughMap(
    options: PluginOption[],
    passthrough: string[]
): Map<string, string | boolean> {

    const known = new Map(options.map((o) => [o.flag, o]))
    const result = new Map<string, string | boolean>()

    for (let i = 0; i < passthrough.length; i++) {
        const arg = passthrough[i]
        const option = known.get(arg)

        if (option === undefined) {
            throw new Error(`Unknown option: ${arg}`)
        }

        if (option.requiresValue === true) {
            const next = passthrough[i + 1]
            if (next === undefined || next.startsWith("-")) {
                throw new Error(`Option ${arg} requires a value`)
            }
            result.set(arg, next)
            i++
        } else {
            result.set(arg, true)
        }
    }

    return result
}

export function parseStringOption(
    flag: string,
    map: Map<string, string | boolean>
): string | undefined {
    const value = map.get(flag)
    if (value === undefined) return undefined
    if (typeof value !== "string") throw new Error(`Option ${flag} requires a string value`)
    return value
}

export function parseBooleanOption(
    flag: string,
    map: Map<string, string | boolean>
): boolean {
    return map.get(flag) === true
}

export function parseNumberOption(
    flag: string,
    map: Map<string, string | boolean>
): number | undefined {
    const value = map.get(flag)
    if (value === undefined) return undefined
    const n = Number(value)
    if (isNaN(n)) throw new Error(`Option ${flag} requires a numeric value`)
    return n
}

export function buildConfig<TConfig extends RunConfig>(
    standard: RunConfig,
    passthroughMap: Map<string, string | boolean>,
    parseOptions?: (standard: RunConfig, passthrough: Map<string, string | boolean>) => TConfig
): TConfig {
    return parseOptions
        ? parseOptions(standard, passthroughMap)
        : standard as TConfig
}
