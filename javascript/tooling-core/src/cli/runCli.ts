import type { PluginDescriptor } from "./PluginDescriptor.js"
import type { FileProcessor, RunConfig } from "../repository/types.js"
import { parseStandardCli } from "./parseStandardCli.js"
import { listFilesToProcess } from "./listFilesToProcess.js"
import { validatePassthrough } from "./validatePassthrough.js"
import { printHelp } from "./printHelp.js"
import { runPlugin } from "./runPlugin.js"

export interface RunCliOptions {
    descriptor: PluginDescriptor
    processor: FileProcessor<RunConfig>
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

export function runCli(options: RunCliOptions): void {

    const argv = options.argv ?? process.argv.slice(2)
    const parsed = attempt(() => parseStandardCli(argv))
    const config = parsed.config
    const positionals = parsed.positionals ?? []

    attempt(() => validatePassthrough(options.descriptor, parsed.passthrough ?? []))

    if (parsed.help) {
        printHelp(options.descriptor)
        process.exit(0)
    }

    const targets = attempt(() => listFilesToProcess(config, positionals))

    attempt(() => runPlugin(targets.files, options.processor, config))
}