import fs from 'node:fs';
import { buildMermaid } from '../../core/buildMermaid';
import {
    normalizeOptions,
    RawOptions,
    NormalizedOptions
} from './normalizeOptions';


async function runExecutor(
    rawOptions: RawOptions
): Promise<{ success: boolean }> {

    let options: NormalizedOptions;

    try {
        options = normalizeOptions(rawOptions);
    } catch (error) {
        return fail((error as Error).message);
    }

    switch (options.mode) {

        case 'inject':
            return handleInject(options);

        case 'check': {
            if (!fs.existsSync(options.generatedMermaidPath!)) {
                return fail(`Generated file not found at: ${options.generatedMermaidPath}`);
            }

            const projectJson = loadProjectJson(options.projectJsonPath);
            if (!projectJson) {
                return { success: false };
            }

            const mermaid = buildMermaid(projectJson as any);
            return handleCheck(options, mermaid);
        }

        case 'generate': {
            const projectJson = loadProjectJson(options.projectJsonPath);
            if (!projectJson) {
                return { success: false };
            }

            const mermaid = buildMermaid(projectJson as any);
            return handleGenerate(options, mermaid);
        }

        case 'update': {
            const projectJson = loadProjectJson(options.projectJsonPath);
            if (!projectJson) {
                return { success: false };
            }

            const mermaid = buildMermaid(projectJson as any);
            return handleUpdate(options, mermaid);
        }

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
    options: NormalizedOptions
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

function handleUpdate(
    options: NormalizedOptions,
    mermaid: string
): { success: boolean } {

    if (!fs.existsSync(options.markdownPath!)) {
        return fail(`Markdown file not found at: ${options.markdownPath}`);
    }

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
