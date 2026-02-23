#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { execSync } from 'node:child_process';
import runExecutor from '@datalackey/nx-graph-to-mermaid';

async function main() {
    const args = process.argv.slice(2);

    if (args.length < 2) {
        console.error(
            'Usage: autogen-markdown-doc <projectJsonPath> <markdownPath>'
        );
        process.exit(1);
    }

    const projectJsonPath = path.resolve(args[0]);
    const markdownPath = path.resolve(args[1]);

    if (!fs.existsSync(projectJsonPath)) {
        console.error(`project.json not found at: ${projectJsonPath}`);
        process.exit(1);
    }

    if (!fs.existsSync(markdownPath)) {
        console.error(`Markdown file not found at: ${markdownPath}`);
        process.exit(1);
    }

    // 1️⃣ Run nx plugin as library
    const result = await runExecutor({
        projectJsonPath,
        mode: 'update',
        markdownPath
    });

    if (!result.success) {
        process.exit(1);
    }

    // 2️⃣ Run update-markdown-toc via its CLI binary
    execSync(
        `node ../../node_modules/@datalackey/update-markdown-toc/bin/update-markdown-toc.js "${markdownPath}"`,
        { stdio: 'inherit' }
    );

    console.log('autogen-markdown-doc: update complete');
}

main();