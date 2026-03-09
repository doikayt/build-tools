import type { RunConfig } from "../repository/types.js"
import type { ParsedCliResult } from "./types.js"

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
    debug: debug
  }

  validateConfig(config, positionals)

  return {
    config: config,
    positionals: positionals,
    passthrough: passthrough,
    help: help,
    version: version
  }
}
