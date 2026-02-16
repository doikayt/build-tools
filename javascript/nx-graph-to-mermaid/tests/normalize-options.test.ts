import { normalizeOptions } from '../src/executors/generate/normalizeOptions';

describe('normalizeOptions()', () => {

    test('defaults to generate mode', () => {
        const result = normalizeOptions({
            projectJsonPath: 'project.json',
            outputPath: 'out.md'
        });

        expect(result.mode).toBe('generate');
    });

    test('throws if projectJsonPath missing', () => {
        expect(() =>
            normalizeOptions({} as any)
        ).toThrow('projectJsonPath is required');
    });

    // ---------------------------
    // GENERATE MODE VALIDATION
    // ---------------------------

    test('generate mode requires outputPath', () => {
        expect(() =>
            normalizeOptions({
                projectJsonPath: 'project.json',
                mode: 'generate'
            })
        ).toThrow('outputPath is required in generate mode');
    });

    test('generate mode rejects existingPath', () => {
        expect(() =>
            normalizeOptions({
                projectJsonPath: 'project.json',
                mode: 'generate',
                outputPath: 'out.md',
                existingPath: 'existing.md'
            })
        ).toThrow('existingPath is invalid in generate mode');
    });

    // ---------------------------
    // CHECK MODE VALIDATION
    // ---------------------------

    test('check mode requires existingPath', () => {
        expect(() =>
            normalizeOptions({
                projectJsonPath: 'project.json',
                mode: 'check'
            })
        ).toThrow('existingPath is required in check mode');
    });

    test('check mode rejects outputPath', () => {
        expect(() =>
            normalizeOptions({
                projectJsonPath: 'project.json',
                mode: 'check',
                existingPath: 'existing.md',
                outputPath: 'out.md'
            })
        ).toThrow('outputPath is invalid in check mode');
    });

    // ---------------------------
    // LEGACY CHECK FLAG
    // ---------------------------

    test('legacy check flag resolves to check mode', () => {
        const result = normalizeOptions({
            projectJsonPath: 'project.json',
            check: true,
            existingPath: 'existing.md'
        });

        expect(result.mode).toBe('check');
    });

});
