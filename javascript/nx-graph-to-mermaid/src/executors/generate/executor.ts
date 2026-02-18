import fs from 'node:fs';
import { buildMermaid } from '../../core/buildMermaid';
import {
    RawOptions,
    NormalizedOptions,
    resolveExecutionContext
} from './normalizeOptions';


/**
 * Main entry point for our NX plugin.
 */
async function runExecutor(
    rawOptions: RawOptions
): Promise<{ success: boolean }> {

    const ctx = resolveExecutionContext(rawOptions);
    if (!ctx.success) {
        return { success: false };
    }

    const { options, project } = ctx;

    switch (options.mode) {

        case 'inject':
            return handleInject(options);

        case 'check':
            return handleCheck(options, buildMermaid(project as any));

        case 'generate':
            return handleGenerate(options, buildMermaid(project as any));

        case 'update':
            return handleUpdate(options, buildMermaid(project as any));

        default: {
            const _exhaustive: never = options.mode;
            return fail(`Unsupported mode: ${_exhaustive}`);
        }
    }
}

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

    const existingContent = fs.readFileSync(options.generatedMermaidPath!, 'utf-8');

    if (existingContent !== mermaid) {
        return fail('Mermaid output drift detected.');
    }

    return { success: true };
}

function handleInject(
    options: NormalizedOptions
): { success: boolean } {

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

function handleUpdate(
    options: NormalizedOptions,
    mermaid: string
): { success: boolean } {

    try {
        if (options.generatedMermaidPath) {
            fs.writeFileSync(options.generatedMermaidPath, mermaid, 'utf-8');
        }

        const markdownContent = fs.readFileSync(options.markdownPath!, 'utf-8');
        const updated = injectBetweenMarkers(markdownContent, mermaid);

        fs.writeFileSync(options.markdownPath!, updated, 'utf-8');

        return { success: true };

    } catch (error) {
        return fail((error as Error).message);
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

export = runExecutor;
