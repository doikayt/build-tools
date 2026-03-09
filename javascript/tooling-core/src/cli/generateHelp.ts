import type { PluginDescriptor } from "./PluginDescriptor.js"

const STANDARD_OPTIONS = [
    { flag: "-c, --check",              description: "Do not write files; exit non-zero if stale" },
    { flag: "-r, --recursive <path>",   description: "Recursively process all .md files under the given folder" },
    { flag: "-e, --exclude <dirs>",     description: "Comma-separated list of directory names to exclude" },
    { flag: "-v, --verbose",            description: "Print status for every file processed" },
    { flag: "-q, --quiet",              description: "Suppress all non-error output" },
    { flag: "-d, --debug",              description: "Print debug diagnostics to stderr" },
    { flag: "-h, --help",               description: "Show this help message and exit" },
]

export function generateHelp(descriptor: PluginDescriptor): string {
    const lines: string[] = []

    lines.push(`${descriptor.name}`)
    lines.push(`  ${descriptor.description}`)
    lines.push("")
    lines.push("Usage:")
    lines.push(`  ${descriptor.name} [options] [file]`)
    lines.push("")
    lines.push("Options:")

    const allOptions = [
        ...descriptor.options.map((o) => ({
            flag: o.requiresValue === true ? `${o.flag} <value>` : o.flag,
            description: o.description
        })),
        ...STANDARD_OPTIONS
    ]

    const flagWidth = Math.max(...allOptions.map((o) => o.flag.length))

    for (const option of allOptions) {
        lines.push(`  ${option.flag.padEnd(flagWidth)}  ${option.description}`)
    }

    return lines.join("\n")
}