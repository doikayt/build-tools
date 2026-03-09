import type { PluginDescriptor } from "./PluginDescriptor.js"
import type { FileProcessor, OutputPolicyConfig } from "../repository/types.js"
import { parseStandardCli } from "./parseStandardCli.js"
import { listFilesToProcess } from "./listFilesToProcess.js"
import { validatePassthrough } from "./validatePassthrough.js"
import { printHelp } from "./printHelp.js"
import { runPlugin } from "./runPlugin.js"

export interface RunCliOptions<TConfig extends OutputPolicyConfig> {
    descriptor: PluginDescriptor
    processor: FileProcessor<TConfig>
    argv?: string[]
}

export function runCli<TConfig extends OutputPolicyConfig>(
    options: RunCliOptions<TConfig>
): void {

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

    if (config.help) {
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
        runPlugin(targets.files, options.processor as FileProcessor<OutputPolicyConfig>, config)
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        console.error(`ERROR: ${message}`)
        process.exit(1)
    }
}