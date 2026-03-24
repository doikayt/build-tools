import type { PluginDescriptor } from "./types.js";

const STANDARD_OPTIONS = [
    { flag: "-c, --check", description: "Do not write files; exit non-zero if stale" },
    {
        flag: "-r, --recursive <path>",
        description: "Recursively process all .md files under the given folder",
    },
    { flag: "-e, --exclude <dir1,dir2...>", description: "Directory names to exclude" },
    {
        flag: "-n, --no-external-link-check",
        description: "Skip external link validation in check mode",
    },
    {
        flag: "-l, --link-timeout-ms <ms>",
        description: "Timeout in milliseconds for external link requests (default: 3000)",
    },
    { flag: "-v, --verbose", description: "Print status for every file processed" },
    { flag: "-q, --quiet", description: "Suppress all non-error output" },
    { flag: "-d, --debug", description: "Print debug diagnostics to stderr" },
    { flag: "-h, --help", description: "Show this help message and exit" },
];

export function generateHelp(descriptor: PluginDescriptor): string {
    const lines: string[] = [];

    lines.push(`${descriptor.name}`);
    lines.push(`  ${descriptor.description}`);
    lines.push("");
    lines.push("Usage:");
    lines.push(`  ${descriptor.name} [options] [file]`);
    lines.push("");
    lines.push("Options:");

    const allOptions = [
        ...descriptor.options.map(o => ({
            flag: o.requiresValue === true ? `${o.flag} <${o.valueName ?? "value"}>` : o.flag,
            description: o.description,
        })),
        ...STANDARD_OPTIONS,
    ];

    const flagWidth = Math.max(...allOptions.map(o => o.flag.length));

    for (const option of allOptions) {
        lines.push(`  ${option.flag.padEnd(flagWidth)}  ${option.description}`);
    }

    return lines.join("\n");
}
