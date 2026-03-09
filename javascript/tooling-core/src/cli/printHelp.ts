import type { PluginDescriptor } from "./types.js"
import { generateHelp } from "./generateHelp.js"

export function printHelp(descriptor: PluginDescriptor): void {
    console.log(generateHelp(descriptor))
}