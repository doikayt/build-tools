#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { execSync } from "node:child_process";
import { createRequire } from "node:module";
import { generate as runExecutor } from "@datalackey/nx-graph-to-mermaid";

const require = createRequire(import.meta.url);

function parseArgs(argv) {
    const args = argv.slice(2);
    let projectJsonPath = undefined;
    const positionals = [];

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (arg === "--project-json" || arg === "-p") {
            const next = args[i + 1];
            if (next === undefined || next.startsWith("-")) {
                console.error("ERROR: --project-json requires a path");
                process.exit(1);
            }
            projectJsonPath = path.resolve(next);
            i++;
        } else if (arg.startsWith("-")) {
            console.error(`ERROR: Unknown option: ${arg}`);
            process.exit(1);
        } else {
            positionals.push(arg);
        }
    }

    return { projectJsonPath: projectJsonPath, positionals: positionals };
}

async function main() {
    const { projectJsonPath, positionals } = parseArgs(process.argv);

    if (positionals.length < 1) {
        console.error("Usage: autogen-markdown-doc [--project-json <path>] <markdownPath>");
        process.exit(1);
    }

    const markdownPath = path.resolve(positionals[0]);

    if (!fs.existsSync(markdownPath)) {
        console.error(`Markdown file not found at: ${markdownPath}`);
        process.exit(1);
    }

    // 1️⃣ Run nx-graph-to-mermaid — only if --project-json was provided
    if (projectJsonPath !== undefined) {
        if (!fs.existsSync(projectJsonPath)) {
            console.error(`project.json not found at: ${projectJsonPath}`);
            process.exit(1);
        }

        const result = await runExecutor({
            projectJsonPath,
            mode: "update",
            markdownPath,
        });

        if (!result.success) {
            process.exit(1);
        }
    }

    // 2️⃣ Run update-markdown-toc
    const tocBin = require.resolve("@datalackey/update-markdown-toc/bin/update-markdown-toc.js");
    execSync(`node "${tocBin}" "${markdownPath}"`, { stdio: "inherit" });

    // 3️⃣ Run update-markdown-uml
    //    Stub prints alive message. Replace with real invocation
    //    once implementation is complete.
    const umlBin = require.resolve("@datalackey/update-markdown-uml/bin/update-markdown-uml.js");
    const umlOutput = execSync(`node "${umlBin}"`, { encoding: "utf-8" });
    process.stdout.write(umlOutput);

    console.log("autogen-markdown-doc: update complete");
}

main();
