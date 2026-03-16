import type { PluginDescriptor } from "./types.js"
import type { FileProcessor, RunConfig } from "../repository/types.js"
import { parseStandardCli, buildPassthroughMap, buildConfig } from "./parseStandardCli.js"
import { listFilesToProcess } from "./listFilesToProcess.js"
import { printHelp } from "./printHelp.js"
import { runPlugin } from "./runPlugin.js"
import { runLinkValidation } from "./runLinkValidation.js"
import { debugLog } from "../logging/debugLog.js"
import type { RepositoryStats } from "../repository/RepositoryRunner.js"

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

export async function runCli<TConfig extends RunConfig = RunConfig>(
    options: RunCliOptions<TConfig>
): Promise<RepositoryStats> {
    const argv = options.argv ?? process.argv.slice(2)

    const parsed = attempt(() => parseStandardCli(argv))
    const positionals = parsed.positionals ?? []

    const passthroughMap = attempt(() =>
        buildPassthroughMap(options.descriptor.options, parsed.passthrough ?? [])
    )

    if (parsed.help) {
        printHelp(options.descriptor)
        process.exit(0)
    }

    const config = attempt(() =>
        buildConfig(parsed.config, passthroughMap, options.descriptor.parseOptions)
    )
    debugLog(config, `runCli: argv=${JSON.stringify(argv)} | config=${JSON.stringify(config)}`)

    attempt(() => options.descriptor.validate?.(config))

    const targets = attempt(() => listFilesToProcess(config, positionals))

    debugLog(config, `runCli: targets=${JSON.stringify(targets.files)}`)

    const stats = await runPlugin(targets.files, options.processor, config)

    debugLog(config, `runCli: stats=${JSON.stringify(stats)}`)

    if (config.runMode === "check") {
        await runLinkValidation(targets.files, config)
    }

    return stats
}
