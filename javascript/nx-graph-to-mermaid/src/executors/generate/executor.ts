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
        return fail((error as Error).message);
    }

    const projectJson = loadProjectJson(options.projectJsonPath);
    if (!projectJson) {
        return { success: false };
    }

    const mermaid = buildMermaid(projectJson as any);

    switch (options.mode) {
        case 'generate':
            return handleGenerate(options, mermaid);

        case 'check':
            return handleCheck(options, mermaid);

        case 'inject':
            return handleInject(options, mermaid);

        default:
            return fail(`Unsupported mode: ${options.mode}`);
    }
}

// --------------------------------------------------
// Mode Handlers
// --------------------------------------------------

function handleGenerate(
    options: NormalizedOptions,
    mermaid: string
): { success: boolean } {

    fs.writeFileSync(options.generatedMermaidPath!, mermaid, 'utf-8');
    return { success: true };
}

function handleCheck(
    options: NormalizedOptions,
    mermaid: string
): { success: boolean } {

    if (!fs.existsSync(options.generatedMermaidPath!)) {
        return fail(`Generated file not found at: ${options.generatedMermaidPath}`);
    }

    const existingContent = fs.readFileSync(options.generatedMermaidPath!, 'utf-8');

    if (existingContent !== mermaid) {
        return fail('Mermaid output drift detected.');
    }

    return { success: true };
}

function handleInject(
    options: NormalizedOptions,
    mermaid: string
): { success: boolean } {

    if (!fs.existsSync(options.generatedMermaidPath!)) {
        return fail(`Generated file not found at: ${options.generatedMermaidPath}`);
    }

    if (!fs.existsSync(options.markdownPath!)) {
        return fail(`Markdown file not found at: ${options.markdownPath}`);
    }

    try {
        const generatedContent = fs.readFileSync(options.generatedMermaidPath!, 'utf-8');
        const markdownContent = fs.readFileSync(options.markdownPath!, 'utf-8');

        const updated = injectBetweenMarkers(markdownContent, generatedContent);

        fs.writeFileSync(options.markdownPath!, updated, 'utf-8');

        return { success: true };

    } catch (error) {
        return fail((error as Error).message);
    }
}

// --------------------------------------------------
// Utilities
// --------------------------------------------------

function loadProjectJson(path: string): unknown | null {

    if (!fs.existsSync(path)) {
        fail(`project.json not found at: ${path}`);
        return null;
    }

    try {
        const raw = fs.readFileSync(path, 'utf-8');
        return JSON.parse(raw);
    } catch {
        fail('Failed to read or parse project.json');
        return null;
    }
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

function fail(message: string): { success: false } {
    console.error(message);
    return { success: false };
}
