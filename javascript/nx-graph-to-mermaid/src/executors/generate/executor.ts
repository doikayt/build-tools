import { ExecutorContext } from '@nx/devkit';
import fs from 'node:fs';
import { buildMermaid } from '../../core/buildMermaid';
import {
    normalizeOptions,
    RawOptions,
    NormalizedOptions
} from './normalizeOptions';

export default async function runExecutor(
    rawOptions: RawOptions,
    context: ExecutorContext
): Promise<{ success: boolean }> {

    let options: NormalizedOptions;

    try {
        options = normalizeOptions(rawOptions);
    } catch (error) {
        console.error((error as Error).message);
        return { success: false };
    }

    if (!fs.existsSync(options.projectJsonPath)) {
        console.error(`project.json not found at: ${options.projectJsonPath}`);
        return { success: false };
    }

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
    if (options.mode === 'check') {

        if (!fs.existsSync(options.existingPath!)) {
            console.error(`Existing file not found at: ${options.existingPath}`);
            return { success: false };
        }

        const existingContent = fs.readFileSync(options.existingPath!, 'utf-8');

        if (existingContent !== mermaid) {
            console.error('Mermaid output drift detected.');
            return { success: false };
        }

        return { success: true };
    }

    // ----------------------
    // GENERATE MODE
    // ----------------------
    try {
        fs.writeFileSync(options.outputPath!, mermaid, 'utf-8');
    } catch {
        console.error(`Failed to write output to: ${options.outputPath}`);
        return { success: false };
    }

    return { success: true };
}
