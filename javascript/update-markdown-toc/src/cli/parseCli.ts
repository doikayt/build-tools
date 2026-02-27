import { parseArgs } from "node:util";
export function parseCli(argv: any) {
    const { values, positionals } = parseArgs({
        args: argv,
        options: {
            check: { type: "boolean", short: "c" },
            recursive: { type: "string", short: "r" },
            exclude: { type: "string", short: "e" },
            verbose: { type: "boolean", short: "v" },
            quiet: { type: "boolean", short: "q" },
            debug: { type: "boolean", short: "d" },
            help: { type: "boolean", short: "h" }
        },
        allowPositionals: true
    });

    // Help flag handled by CLI wrapper
    if (values.help) {
        return Object.freeze({
            help: true
        });
    }

    const recursivePath = values.recursive ?? null;
    const targetFile = positionals.length > 0 ? positionals[0] : null;

    const isRecursive = Boolean(recursivePath);

    if (isRecursive && targetFile) {
        throw new Error(
            "Cannot combine --recursive with a positional file argument."
        );
    }

    if (values.quiet && values.verbose) {
        throw new Error("--quiet and --verbose cannot be used together.");
    }

    if (values.check && !isRecursive && !targetFile) {
        throw new Error("--check requires a file argument or --recursive.");
    }

    let excludeList = null;

    if (typeof values.exclude === "string") {
        excludeList = values.exclude
            .split(",")
            .map(s => s.trim())
            .filter(Boolean);
    }

    const config = {
        checkMode: Boolean(values.check),
        verbose: Boolean(values.verbose),
        quiet: Boolean(values.quiet),
        debug: Boolean(values.debug),
        isRecursive,
        recursivePath,
        targetFile,
        excludeList
    };

    return Object.freeze(config);
}
