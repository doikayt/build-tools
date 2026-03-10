import * as fs from 'fs';
import * as path from 'path';
import runExecutor from '../src/executors/generate/executor';
import { safeUnlink } from './utils/fs';

describe('check mode behavior', () => {

    // Use absolute paths from the beginning
    const tmpDir = path.resolve(__dirname);
    const projectPath = path.resolve(tmpDir, 'tmp-project.json');
    const generatedPath = path.resolve(tmpDir, 'tmp-generated.md');

    let consoleSpy: jest.SpyInstance;

    beforeEach(() => {
        safeUnlink(generatedPath)
        fs.writeFileSync(
            projectPath,
            JSON.stringify({
                targets: {
                    build: {
                        description: 'Compile source'
                    }
                }
            }),
            'utf-8'
        );

        consoleSpy = jest
            .spyOn(console, 'error')
            .mockImplementation(() => {});
    });

    afterEach(() => {
        safeUnlink(projectPath);
        safeUnlink(generatedPath);
        consoleSpy.mockRestore();
    });

    // -----------------------------------------
    // A — Existing file missing → fail
    // -----------------------------------------
    test('fails if generated file missing in check mode', async () => {

        const result = await runExecutor({
            projectJsonPath: projectPath,
            mode: 'check',
            generatedMermaidPath: generatedPath
        });

        expect(result.success).toBe(false);
        expect(consoleSpy).toHaveBeenCalledWith(
            expect.stringContaining('Generated file not found at:')
        );
    });

    // -----------------------------------------
    // B — Drift detected → fail
    // -----------------------------------------
    test('fails if drift detected', async () => {

        // Write incorrect content to existing generated file
        fs.writeFileSync(generatedPath, 'WRONG CONTENT', 'utf-8');

        const result = await runExecutor({
            projectJsonPath: projectPath,
            mode: 'check',
            generatedMermaidPath: generatedPath
        });

        expect(result.success).toBe(false);
        expect(consoleSpy).toHaveBeenCalledWith(
            'Mermaid output drift detected.'
        );
    });

    // -----------------------------------------
    // C — Exact match → succeed
    // -----------------------------------------
    test('succeeds if no drift', async () => {

        await runExecutor({
            projectJsonPath: projectPath,
            mode: 'generate',
            generatedMermaidPath: generatedPath
        });

        const result = await runExecutor({
            projectJsonPath: projectPath,
            mode: 'check',
            generatedMermaidPath: generatedPath
        });

        expect(result.success).toBe(true);
        expect(consoleSpy).not.toHaveBeenCalled();
    });

});
