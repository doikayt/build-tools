import fs from 'fs';
import path from 'path';
import runExecutor from '../src/executors/generate/executor';
import { safeUnlink } from './utils/fs';

describe('check mode behavior', () => {

    const tmpDir = __dirname;
    const projectPath = path.join(tmpDir, 'tmp-project.json');
    const generatedPath = path.join(tmpDir, 'tmp-generated.md');

    let consoleSpy: jest.SpyInstance;

    beforeEach(() => {
        fs.writeFileSync(
            projectPath,
            JSON.stringify({
                targets: {
                    build: {
                        description: 'Compile source'
                    }
                }
            })
        );

        consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
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

        const result = await runExecutor(
            {
                projectJsonPath: projectPath,
                mode: 'check',
                generatedMermaidPath: generatedPath
            },
            {} as any
        );

        expect(result.success).toBe(false);
        expect(consoleSpy).toHaveBeenCalledWith(
            `Generated file not found at: ${generatedPath}`
        );
    });

    // -----------------------------------------
    // B — Drift detected → fail
    // -----------------------------------------
    test('fails if drift detected', async () => {

        fs.writeFileSync(generatedPath, 'WRONG CONTENT', 'utf-8');

        const result = await runExecutor(
            {
                projectJsonPath: projectPath,
                mode: 'check',
                generatedMermaidPath: generatedPath
            },
            {} as any
        );

        expect(result.success).toBe(false);
        expect(consoleSpy).toHaveBeenCalledWith(
            'Mermaid output drift detected.'
        );
    });

    // -----------------------------------------
    // C — Exact match → succeed
    // -----------------------------------------
    test('succeeds if no drift', async () => {

        await runExecutor(
            {
                projectJsonPath: projectPath,
                mode: 'generate',
                generatedMermaidPath: generatedPath
            },
            {} as any
        );

        const result = await runExecutor(
            {
                projectJsonPath: projectPath,
                mode: 'check',
                generatedMermaidPath: generatedPath
            },
            {} as any
        );

        expect(result.success).toBe(true);
        expect(consoleSpy).not.toHaveBeenCalled();
    });

});
