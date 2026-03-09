import type { PluginDescriptor } from "./PluginDescriptor.js"

export function validatePassthrough(
    descriptor: PluginDescriptor,
    passthrough: string[]
): void {
    const knownOptions = new Map(
        descriptor.options.map((o) => [o.flag, o])
    )

    for (let i = 0; i < passthrough.length; i++) {
        const arg = passthrough[i]
        const option = knownOptions.get(arg)

        if (option === undefined) {
            throw new Error(`Unknown option: ${arg}`)
        }

        if (option.requiresValue === true) {
            const next = passthrough[i + 1]
            if (next === undefined || next.startsWith("-")) {
                throw new Error(`Option ${arg} requires a value`)
            }
            i++
        }
    }
}