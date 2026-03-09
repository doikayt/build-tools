import type { PluginDescriptor } from "./PluginDescriptor.js"
import type { FileProcessor, CoreConfig } from "../repository/types.js"
import { parseStandardCli } from "./parseStandardCli.js"
import { listFilesToProcess } from "./listFilesToProcess.js"
import { validatePassthrough } from "./validatePassthrough.js"
import { printHelp } from "./printHelp.js"
import { runPlugin } from "./runPlugin.js"

export interface RunCliOptions {
    descriptor: PluginDescriptor
    processor: FileProcessor<CoreConfig>
    argv?: string[]
}

export function runCli(options: RunCliOptions): void {

    const argv = options.argv ?? process.argv.slice(2)

    let parsed

    try {
        parsed = parseStandardCli(argv)
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        console.error(`ERROR: ${message}`)
        process.exit(1)
    }

    const config = parsed.config
    const positionals = parsed.positionals ?? []

    try {
        validatePassthrough(options.descriptor, parsed.passthrough ?? [])
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        console.error(`ERROR: ${message}`)
        process.exit(1)
    }

    if (parsed.help) {
        printHelp(options.descriptor)
        process.exit(0)
    }

    let targets

    try {
        targets = listFilesToProcess(config, positionals)
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        console.error(`ERROR: ${message}`)
        process.exit(1)
    }

    try {
        runPlugin(targets.files, options.processor, config)
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        console.error(`ERROR: ${message}`)
        process.exit(1)
    }
}
