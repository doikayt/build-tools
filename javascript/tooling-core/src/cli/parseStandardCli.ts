import type {
  StandardCliConfig,
  ParsedCliResult
} from "./types.js"

export function parseStandardCli(argv: string[]): ParsedCliResult {

  console.error("DEBUG parseStandardCli() called with argv:", argv)

  const args = argv
  console.error("DEBUG normalized args:", args)

  const config = createDefaultConfig()
  const positionals: string[] = []
  const passthrough: string[] = []

  parseArguments(args, config, positionals, passthrough)

  console.error("DEBUG after parseArguments:")
  console.error("DEBUG config:", config)
  console.error("DEBUG positionals:", positionals)
  console.error("DEBUG passthrough:", passthrough)

  if (!config.help && !config.version) {
    validateFlagConflicts(config)
  }

  const result: ParsedCliResult = {
    config,
    positionals,
    passthrough
  }

  console.error("DEBUG returning result:", result)

  return result
}


function createDefaultConfig(): StandardCliConfig {

  const config: StandardCliConfig = {
    help: false,
    version: false,

    verbose: false,
    quiet: false,
    debug: false,

    checkMode: false,

    mode: "single",

    exclude: []
  }

  console.error("DEBUG createDefaultConfig() ->", config)

  return config
}


function parseArguments(
    args: string[],
    config: StandardCliConfig,
    positionals: string[],
    passthrough: string[]
): void {

  console.error("DEBUG parseArguments() starting")

  for (let i = 0; i < args.length; i++) {

    const arg = args[i]

    console.error("DEBUG processing arg:", arg)

    switch (arg) {

      case "-h":
      case "--help":
        console.error("DEBUG matched help flag")
        config.help = true
        continue

      case "--version":
        console.error("DEBUG matched version flag")
        config.version = true
        continue

      case "-v":
      case "--verbose":
        console.error("DEBUG matched verbose flag")
        config.verbose = true
        continue

      case "-q":
      case "--quiet":
        console.error("DEBUG matched quiet flag")
        config.quiet = true
        continue

      case "-d":
      case "--debug":
        console.error("DEBUG matched debug flag")
        config.debug = true
        continue

      case "-c":
      case "--check":
        console.error("DEBUG matched check flag")
        config.checkMode = true
        continue

      case "-r":
      case "--recursive": {

        console.error("DEBUG matched recursive flag")

        const next = args[i + 1]
        console.error("DEBUG recursive argument:", next)

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

        console.error("DEBUG matched exclude flag")

        const next = args[i + 1]
        console.error("DEBUG exclude argument:", next)

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

        console.error("DEBUG parsed exclude list:", config.exclude)

        i++
        continue
      }

      default:

        console.error("DEBUG default branch for arg:", arg)

        if (arg.startsWith("-")) {
          console.error("DEBUG treating as passthrough flag")
          passthrough.push(arg)
          continue
        }

        console.error("DEBUG treating as positional")
        positionals.push(arg)
    }
  }

  console.error("DEBUG parseArguments() finished")
}


function validateFlagConflicts(config: StandardCliConfig): void {

  console.error("DEBUG validateFlagConflicts()")

  if (config.verbose && config.quiet) {
    console.error("DEBUG conflict detected: verbose + quiet")
    throw new Error("Cannot use --verbose and --quiet together")
  }
}