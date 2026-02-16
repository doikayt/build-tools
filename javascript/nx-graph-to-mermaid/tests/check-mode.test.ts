
import fs from 'fs';
import path from 'path';
import runExecutor from '../src/executors/generate/executor';
import { safeUnlink } from './utils/fs';

describe('check mode behavior', () => {

    const tmpDir = __dirname;
    const projectPath = path.join(tmpDir, 'tmp-project.json');
    const generatedPath = path.join(tmpDir, 'tmp-generated.md');

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
    });

    afterEach(() => {
        safeUnlink(projectPath);
        safeUnlink(generatedPath);
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
    });

    // -----------------------------------------
    // B — Drift detected → fail
    // -----------------------------------------
    test('fails if drift detected', async () => {

        // Write incorrect content
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
    });

    // -----------------------------------------
    // C — Exact match → succeed
    // -----------------------------------------
    test('succeeds if no drift', async () => {

        // First generate correct output
        await runExecutor(
            {
                projectJsonPath: projectPath,
                mode: 'generate',
                generatedMermaidPath: generatedPath
            },
            {} as any
        );

        // Now check
        const result = await runExecutor(
            {
                projectJsonPath: projectPath,
                mode: 'check',
                generatedMermaidPath: generatedPath
            },
            {} as any
        );

        expect(result.success).toBe(true);
    });

});



