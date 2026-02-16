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

    const projectJsonRaw = fs.readFileSync(options.projectJsonPath, 'utf-8');
    const projectJson = JSON.parse(projectJsonRaw);

    const mermaid = buildMermaid(projectJson as any);

    // ----------------------
    // GENERATE MODE
    // ----------------------
    if (options.mode === 'generate') {

        fs.writeFileSync(options.generatedMermaidPath!, mermaid, 'utf-8');
        return { success: true };
    }

    // ----------------------
    // CHECK MODE
    // ----------------------
    if (options.mode === 'check') {

        if (!fs.existsSync(options.generatedMermaidPath!)) {
            console.error(`Generated file not found at: ${options.generatedMermaidPath}`);
            return { success: false };
        }

        const existingContent = fs.readFileSync(options.generatedMermaidPath!, 'utf-8');

        if (existingContent !== mermaid) {
            console.error('Mermaid output drift detected.');
            return { success: false };
        }

        return { success: true };
    }

    // ----------------------
    // INJECT MODE
    // ----------------------
    if (options.mode === 'inject') {

        if (!fs.existsSync(options.generatedMermaidPath!)) {
            console.error(`Generated file not found at: ${options.generatedMermaidPath}`);
            return { success: false };
        }

        if (!fs.existsSync(options.markdownPath!)) {
            console.error(`Markdown file not found at: ${options.markdownPath}`);
            return { success: false };
        }

        const generatedContent = fs.readFileSync(options.generatedMermaidPath!, 'utf-8');
        const markdownContent = fs.readFileSync(options.markdownPath!, 'utf-8');

        const updated = injectBetweenMarkers(markdownContent, generatedContent);

        fs.writeFileSync(options.markdownPath!, updated, 'utf-8');

        return { success: true };
    }

    return { success: false };
}

function injectBetweenMarkers(markdown: string, content: string): string {
    const start = '<!-- NX_GRAPH:START -->';
    const end = '<!-- NX_GRAPH:END -->';

    const startIndex = markdown.indexOf(start);
    const endIndex = markdown.indexOf(end);

    if (startIndex === -1 || endIndex === -1 || endIndex <= startIndex) {
        throw new Error('NX_GRAPH markers not found or invalid');
    }

    const before = markdown.substring(0, startIndex + start.length);
    const after = markdown.substring(endIndex);

    return `${before}\n${content}\n${after}`;
}
