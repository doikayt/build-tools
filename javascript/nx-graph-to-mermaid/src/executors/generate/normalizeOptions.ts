export type Mode = 'generate' | 'check' | 'inject';

export interface RawOptions {
    projectJsonPath: string;
    mode?: Mode;
    generatedMermaidPath?: string;
    markdownPath?: string;
}

export interface NormalizedOptions {
    projectJsonPath: string;
    mode: Mode;
    generatedMermaidPath?: string;
    markdownPath?: string;
}

export function normalizeOptions(raw: RawOptions): NormalizedOptions {
    if (!raw.projectJsonPath) {
        throw new Error('projectJsonPath is required');
    }

    const mode: Mode = raw.mode ?? 'generate';

    // -------------------------
    // GENERATE MODE
    // -------------------------
    if (mode === 'generate') {

        if (!raw.generatedMermaidPath) {
            throw new Error('generatedMermaidPath is required in generate mode');
        }

        if (raw.markdownPath) {
            throw new Error('markdownPath is invalid in generate mode');
        }

        return {
            projectJsonPath: raw.projectJsonPath,
            mode,
            generatedMermaidPath: raw.generatedMermaidPath
        };
    }

    // -------------------------
    // CHECK MODE
    // -------------------------
    if (mode === 'check') {

        if (!raw.generatedMermaidPath) {
            throw new Error('generatedMermaidPath is required in check mode');
        }

        if (raw.markdownPath) {
            throw new Error('markdownPath is invalid in check mode');
        }

        return {
            projectJsonPath: raw.projectJsonPath,
            mode,
            generatedMermaidPath: raw.generatedMermaidPath
        };
    }

    // -------------------------
    // INJECT MODE
    // -------------------------
    if (mode === 'inject') {

        if (!raw.generatedMermaidPath) {
            throw new Error('generatedMermaidPath is required in inject mode');
        }

        if (!raw.markdownPath) {
            throw new Error('markdownPath is required in inject mode');
        }

        return {
            projectJsonPath: raw.projectJsonPath,
            mode,
            generatedMermaidPath: raw.generatedMermaidPath,
            markdownPath: raw.markdownPath
        };
    }

    throw new Error(`Unsupported mode: ${mode}`);
}
