import fs from 'node:fs';
import { buildMermaid } from '../../core/buildMermaid.js';
import {
    RawOptions,
    NormalizedOptions,
    resolveExecutionContext
} from './normalizeOptions.js';
import { injectBetweenMarkers } from '@datalackey/tooling-core';

const NX_GRAPH_START = '<!-- NX_GRAPH:START -->';
const NX_GRAPH_END = '<!-- NX_GRAPH:END -->';

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
            const _exhaustive: never = options.mode as never;
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
        const updated = injectBetweenMarkers(markdownContent, generatedContent, NX_GRAPH_START, NX_GRAPH_END);

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
        const updated = injectBetweenMarkers(markdownContent, mermaid, NX_GRAPH_START, NX_GRAPH_END);

        fs.writeFileSync(options.markdownPath!, updated, 'utf-8');

        return { success: true };

    } catch (error) {
        return fail((error as Error).message);
    }
}

function fail(message: string): { success: false } {
    console.error(message);
    return { success: false };
}

export default runExecutor;
