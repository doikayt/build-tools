import type { RunMode } from "./runMode.js";
import type {
  StandardCliConfig,
  ParsedCliResult
} from "./types.js"

export function parseStandardCli(argv: string[]): ParsedCliResult {

  const args = argv

  const config = createDefaultConfig()
  const positionals: string[] = []
  const passthrough: string[] = []

  parseArguments(args, config, positionals, passthrough)

  if (!config.help && !config.version) {
    validateFlagConflicts(config)
  }

  const result: ParsedCliResult = {
    config,
    positionals,
    passthrough
  }


  return result
}


function createDefaultConfig(): StandardCliConfig {

  const config: StandardCliConfig = {
    help: false,
    version: false,

    verbose: false,
    quiet: false,
    debug: false,

    runMode: "update",

    mode: "single",

    exclude: []
  }


  return config
}


function parseArguments(
    args: string[],
    config: StandardCliConfig,
    positionals: string[],
    passthrough: string[]
): void {

  for (let i = 0; i < args.length; i++) {

    const arg = args[i]

    switch (arg) {

      case "-h":
      case "--help":
        config.help = true
        continue

      case "--version":
        config.version = true
        continue

      case "-v":
      case "--verbose":
        config.verbose = true
        continue

      case "-q":
      case "--quiet":
        config.quiet = true
        continue

      case "-d":
      case "--debug":
        config.debug = true
        continue

      case "-c":
      case "--check":
        config.runMode = "check"
        continue

      case "-r":
      case "--recursive": {

        const next = args[i + 1]

        if (next === undefined || next.startsWith("-")) {
          throw new Error("--recursive requires a path")
        }

        config.mode = "recursive"
        config.recursivePath = next

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

        config.exclude =
            next === ""
                ? []
                : next
                    .split(",")
                    .map((s) => s.trim())
                    .filter((s) => s.length > 0)

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
}


function validateFlagConflicts(config: StandardCliConfig): void {

  if (config.verbose && config.quiet) {
    throw new Error("Cannot use --verbose and --quiet together")
  }
}