import fs from 'fs';
import path from 'path';
import runExecutor from '../src/executors/generate/executor';

describe('generate executor - positive flow', () => {
    const tmpDir = __dirname;

    const projectPath = path.join(tmpDir, 'tmp-project.json');
    const outputPath = path.join(tmpDir, 'tmp-output.md');

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
        if (fs.existsSync(projectPath)) {
            fs.unlinkSync(projectPath);
        }
        if (fs.existsSync(outputPath)) {
            fs.unlinkSync(outputPath);
        }
    });

    test('writes generated mermaid to output file', async () => {
        const result = await runExecutor(
            {
                projectJsonPath: projectPath,
                outputPath: outputPath
            },
            {} as any
        );

        expect(result.success).toBe(true);

        const fileContent = fs.readFileSync(outputPath, 'utf-8');

        expect(fileContent).toBe(
            'graph TD\n\n' +
            '  build["build<br/>Compile source"]\n'
        );
    });
});
