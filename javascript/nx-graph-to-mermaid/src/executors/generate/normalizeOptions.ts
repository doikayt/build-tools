export type Mode = 'generate' | 'check';

export interface RawOptions {
    projectJsonPath: string;
    injectInto?: string;
    check?: boolean;       // legacy
    outputPath?: string;
    mode?: Mode;
    existingPath?: string;
}

export interface NormalizedOptions {
    projectJsonPath: string;
    mode: Mode;
    outputPath?: string;
    existingPath?: string;
}

export function normalizeOptions(raw: RawOptions): NormalizedOptions {
    if (!raw.projectJsonPath) {
        throw new Error('projectJsonPath is required');
    }

    // Resolve mode (legacy fallback)
    const mode: Mode =
        raw.mode ??
        (raw.check ? 'check' : 'generate');

    // -------------------------
    // GENERATE MODE CONTRACT
    // -------------------------
    if (mode === 'generate') {

        if (!raw.outputPath) {
            throw new Error('outputPath is required in generate mode');
        }

        if (raw.existingPath) {
            throw new Error('existingPath is invalid in generate mode');
        }

        return {
            projectJsonPath: raw.projectJsonPath,
            mode,
            outputPath: raw.outputPath
        };
    }

    // -------------------------
    // CHECK MODE CONTRACT
    // -------------------------
    if (mode === 'check') {

        if (!raw.existingPath) {
            throw new Error('existingPath is required in check mode');
        }

        if (raw.outputPath) {
            throw new Error('outputPath is invalid in check mode');
        }

        return {
            projectJsonPath: raw.projectJsonPath,
            mode,
            existingPath: raw.existingPath
        };
    }

    throw new Error(`Unsupported mode: ${mode}`);
}
