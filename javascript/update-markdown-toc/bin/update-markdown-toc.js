#!/usr/bin/env node

import { resolve } from "node:path";
import { existsSync, statSync } from "node:fs";

import { parseArgs } from "node:util";

import fs from "fs";
import path from "path";
import GithubSlugger from "github-slugger";


const START = "<!-- TOC:START -->";
const END   = "<!-- TOC:END -->";

function printHelp() {
    console.log(`
update-markdown-toc [options] [file]

Options:
  -c, --check
  -r, --recursive <path>
  -e, --exclude <dir1,dir2,...>
  -v, --verbose
  -q, --quiet
  -d, --debug
  -h, --help
`);
}

try {
    const config = parseCli(process.argv.slice(2));

    if (config.help) {
        printHelp();
        process.exit(0);
    }

    if (config.isRecursive) {
        const resolved = resolve(process.cwd(), config.recursivePath);

        if (!existsSync(resolved)) {
            console.error("ERROR: Recursive path does not exist");
            process.exit(1);
        }

        if (!statSync(resolved).isDirectory()) {
            console.error("ERROR: --recursive requires a directory");
            process.exit(1);
        }

        process.exit(runRecursive(resolved, config));
    }

    const resolved = resolve(
        process.cwd(),
        config.targetFile || "README.md"
    );

    process.exit(runSingleFile(resolved, config));

} catch (err) {
    console.error(`ERROR: ${err.message}`);
    process.exit(1);
}



/**
 * Pure CLI parser.
 *
 * - No console output
 * - No process.exit
 * - Throws on validation errors
 * - Returns frozen config object
 */
export function parseCli(argv) {
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



/* ============================================================
 * Utilities
 * ============================================================ */

function detectLineEnding(text) {
    return text.includes("\r\n") ? "\r\n" : "\n";
}

function collectMarkdownFiles(dir, excludeList) {
    const results = [];

    const exclusions = Array.isArray(excludeList)
        ? excludeList
        : ["node_modules"];

    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            if (exclusions.includes(entry.name)) continue;
            results.push(...collectMarkdownFiles(full, excludeList));
        } else if (entry.isFile() && entry.name.endsWith(".md")) {
            results.push(full);
        }
    }

    return results;
}

function generateTOC(content) {
    const lineEnding = detectLineEnding(content);

    const hasStart = content.includes(START);
    const hasEnd   = content.includes(END);

    if (!hasStart && !hasEnd) throw new Error("TOC delimiters not found");
    if (hasStart && !hasEnd)  throw new Error("TOC start delimiter found without end");
    if (!hasStart && hasEnd)  throw new Error("TOC end delimiter found without start");

    const startIndex = content.indexOf(START);
    const endIndex   = content.indexOf(END);

    const before = content.slice(0, startIndex);
    const after  = content.slice(endIndex + END.length);

    const contentWithoutTOC =
        before.replace(/\s*$/, "") +
        lineEnding +
        after.replace(/^\s*/, "");

    const lines = contentWithoutTOC.split(lineEnding);
    const headings = [];
    const slugger = new GithubSlugger();

    for (const line of lines) {
        const m = /^(#{1,6})\s+(.*)$/.exec(line);
        if (!m) continue;

        const level = m[1].length;
        const title = m[2].trim();
        const anchor = slugger.slug(title);

        headings.push({ level, title, anchor });
    }

    if (headings.length === 0) {
        throw new Error("No headings found to generate TOC");
    }

    const minLevel = Math.min(...headings.map(h => h.level));

    const tocLines = headings.map(h => {
        const indent = "  ".repeat(h.level - minLevel);
        return `${indent}- [${h.title}](#${h.anchor})`;
    });

    const tocBlock =
        lineEnding +
        tocLines.join(lineEnding) +
        lineEnding;

    return before + START + tocBlock + END + after;
}

/* ============================================================
 * Core file processor
 * ============================================================ */

function processFile(filePath, config) {
    const { checkMode, isRecursive } = config;

    let content;

    try {
        content = fs.readFileSync(filePath, "utf8");
    } catch {
        const absolutePath = path.resolve(filePath);
        throw new Error(`Unable to read markdown file: ${absolutePath}`);
    }

    let updated;

    try {
        updated = generateTOC(content);
    } catch (err) {
        if (err.message === "TOC delimiters not found" && isRecursive) {
            return { status: "skipped" };
        }

        const absolutePath = path.resolve(filePath);
        throw new Error(`${absolutePath}: ${err.message}`);
    }

    if (updated === content) {
        return { status: "unchanged" };
    }

    if (checkMode) {
        return { status: "stale" };
    }

    fs.writeFileSync(filePath, updated, "utf8");
    return { status: "updated" };
}

/* ============================================================
 * Public API
 * ============================================================ */

export function runSingleFile(filePath, config) {
    const result = processFile(filePath, config);

    if (config.checkMode && result.status === "stale") {
        if (config.verbose && !config.quiet) {
            console.log(`Stale: ${filePath}`);
        }
        return 1;
    }

    printStatus(result.status, filePath, config);

    return 0;
}

export function runRecursive(rootDir, config) {
    const files = collectMarkdownFiles(rootDir, config.excludeList);
    files.sort();

    let staleFound = false;

    for (const file of files) {
        try {
            const result = processFile(file, config);

            if (config.checkMode && result.status === "stale") {
                staleFound = true;
            }

            printStatus(result.status, file, config);
        } catch (err) {
            console.error(`ERROR: ${err.message}`);
            return 1;
        }
    }

    if (config.checkMode && staleFound) return 1;
    return 0;
}

/* ============================================================
 * Output logic
 * ============================================================ */

function printStatus(status, filePath, config) {
    const { checkMode, verbose, quiet } = config;

    if (quiet) return;

    if (checkMode) {
        if (status === "stale") {
            console.log(`Stale: ${filePath}`);
        } else if (status === "unchanged" && verbose) {
            console.log(`Up-to-date: ${filePath}`);
        } else if (status === "skipped" && verbose) {
            console.log(`Skipped (no markers): ${filePath}`);
        }
        return;
    }

    if (verbose) {
        if (status === "updated") {
            console.log(`Updated: ${filePath}`);
        } else if (status === "unchanged") {
            console.log(`Up-to-date: ${filePath}`);
        } else if (status === "skipped") {
            console.log(`Skipped (no markers): ${filePath}`);
        }
        return;
    }

    if (status === "updated") {
        console.log(`Updated: ${filePath}`);
    }
}
