export type Mode = 'generate' | 'check' | 'inject' | 'update';

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

    switch (mode) {

        case 'generate': {
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

        case 'check': {
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

        case 'inject': {
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

        case 'update': {
            if (!raw.markdownPath) {
                throw new Error('markdownPath is required in update mode');
            }

            return {
                projectJsonPath: raw.projectJsonPath,
                mode,
                generatedMermaidPath: raw.generatedMermaidPath,
                markdownPath: raw.markdownPath
            };
        }

        default: {
            const _exhaustive: never = mode;
            throw new Error(`Unsupported mode: ${_exhaustive}`);
        }
    }
}
