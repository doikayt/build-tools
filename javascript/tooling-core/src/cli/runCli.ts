import type { PluginDescriptor } from "./types.js"
import type { FileProcessor, RunConfig } from "../repository/types.js"
import { parseStandardCli, buildPassthroughMap, buildConfig } from "./parseStandardCli.js"
import { listFilesToProcess } from "./listFilesToProcess.js"
import { printHelp } from "./printHelp.js"
import { runPlugin } from "./runPlugin.js"

export interface RunCliOptions<TConfig extends RunConfig = RunConfig> {
    descriptor: PluginDescriptor<TConfig>
    processor: FileProcessor<TConfig>
    argv?: string[]
}

function attempt<T>(fn: () => T): T {
    try {
        return fn()
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        console.error(`ERROR: ${message}`)
        process.exit(1)
    }
}

export function runCli<TConfig extends RunConfig = RunConfig>(
    options: RunCliOptions<TConfig>
): void {

    const argv = options.argv ?? process.argv.slice(2)
    const parsed = attempt(() => parseStandardCli(argv))
    const standard = parsed.config
    const positionals = parsed.positionals ?? []

    const passthroughMap = attempt(() =>
        buildPassthroughMap(options.descriptor.options, parsed.passthrough ?? [])
    )

    if (parsed.help) {
        printHelp(options.descriptor)
        process.exit(0)
    }

    const config = attempt(() =>
        buildConfig(standard, passthroughMap, options.descriptor.parseOptions)
    )

    attempt(() => options.descriptor.validate?.(config))

    const targets = attempt(() => listFilesToProcess(config, positionals))

    attempt(() => runPlugin(targets.files, options.processor, config))
}
