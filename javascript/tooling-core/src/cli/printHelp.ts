import type { PluginDescriptor } from "./PluginDescriptor.js"
import { generateHelp } from "./generateHelp.js"

export function printHelp(descriptor: PluginDescriptor): void {
    console.log(generateHelp(descriptor))
}