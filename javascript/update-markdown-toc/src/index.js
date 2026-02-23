import fs from "fs";
import path from "path";
import GithubSlugger from "github-slugger";

const START = "<!-- TOC:START -->";
const END   = "<!-- TOC:END -->";

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