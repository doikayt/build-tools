import fs from 'node:fs';
import { buildMermaid } from '../../core/buildMermaid';
import {
    normalizeOptions,
    RawOptions,
    NormalizedOptions
} from './normalizeOptions';

type PreflightResult =
    | { success: true; project?: unknown }
    | { success: false };

async function runExecutor(
    rawOptions: RawOptions
): Promise<{ success: boolean }> {

    let options: NormalizedOptions;

    try {
        options = normalizeOptions(rawOptions);
    } catch (error) {
        return fail((error as Error).message);
    }

    const pre = preflight(options);
    if (!pre.success) {
        return { success: false };
    }

    switch (options.mode) {

        case 'inject':
            return handleInject(options);

        case 'check': {
            const mermaid = buildMermaid(pre.project as any);
            return handleCheck(options, mermaid);
        }

        case 'generate': {
            const mermaid = buildMermaid(pre.project as any);
            return handleGenerate(options, mermaid);
        }

        case 'update': {
            const mermaid = buildMermaid(pre.project as any);
            return handleUpdate(options, mermaid);
        }

        default: {
            const _exhaustive: never = options.mode;
            return fail(`Unsupported mode: ${_exhaustive}`);
        }
    }
}

function preflight(options: NormalizedOptions): PreflightResult {

    // INJECT mode: only validate files required for injection
    if (options.mode === 'inject') {

        if (!fs.existsSync(options.generatedMermaidPath!)) {
            return fail(`Generated file not found at: ${options.generatedMermaidPath}`);
        }

        if (!fs.existsSync(options.markdownPath!)) {
            return fail(`Markdown file not found at: ${options.markdownPath}`);
        }

        return { success: true };
    }

    // CHECK mode: ensure generated file exists before rebuilding
    if (options.mode === 'check') {
        if (!fs.existsSync(options.generatedMermaidPath!)) {
            return fail(`Generated file not found at: ${options.generatedMermaidPath}`);
        }
    }

    // GENERATE, CHECK, UPDATE require project.json
    const project = loadProjectJson(options.projectJsonPath);
    if (!project) {
        return { success: false };
    }

    return { success: true, project };
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

export = runExecutor;
