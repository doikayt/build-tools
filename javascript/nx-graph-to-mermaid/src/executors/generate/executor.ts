import { ExecutorContext } from '@nx/devkit';
import fs from 'node:fs';
import { buildMermaid } from '../../core/buildMermaid';

interface Options {
    projectJsonPath: string;
    injectInto?: string;
    check?: boolean; // legacy, kept for compatibility
    outputPath?: string;
    mode?: 'generate' | 'check';
    existingPath?: string;
}

export default async function runExecutor(
    options: Options,
    context: ExecutorContext
): Promise<{ success: boolean }> {

    // Validate project.json existence
    if (!fs.existsSync(options.projectJsonPath)) {
        console.error(`project.json not found at: ${options.projectJsonPath}`);
        return { success: false };
    }

    // Preserve existing injectInto validation
    if (options.injectInto && !fs.existsSync(options.injectInto)) {
        console.error(`Markdown file not found at: ${options.injectInto}`);
        return { success: false };
    }

    const mode = options.mode ?? 'generate';

    // Read and parse project.json
    let projectJsonRaw: string;
    let projectJson: unknown;

    try {
        projectJsonRaw = fs.readFileSync(options.projectJsonPath, 'utf-8');
        projectJson = JSON.parse(projectJsonRaw);
    } catch {
        console.error('Failed to read or parse project.json');
        return { success: false };
    }

    const mermaid = buildMermaid(projectJson as any);

    // ----------------------
    // CHECK MODE
    // ----------------------

    if (mode === 'check') {

        if (!options.existingPath) {
            console.error('existingPath is required in check mode');
            return { success: false };
        }

        if (!fs.existsSync(options.existingPath)) {
            console.error(`Existing file not found at: ${options.existingPath}`);
            return { success: false };
        }

        const existingContent = fs.readFileSync(options.existingPath, 'utf-8');

        if (existingContent !== mermaid) {
            console.error('Mermaid output drift detected.');
            return { success: false };
        }

        return { success: true };
    }

    // ----------------------
    // GENERATE MODE (default)
    // ----------------------

    if (options.outputPath) {
        try {
            fs.writeFileSync(options.outputPath, mermaid, 'utf-8');
        } catch {
            console.error(`Failed to write output to: ${options.outputPath}`);
            return { success: false };
        }
    }

    return { success: true };
}
