import fs from 'fs';
import path from 'path';
import runExecutor from '../src/executors/generate/executor';
import { safeUnlink } from './utils/fs';

describe('inject mode behavior', () => {

    const tmpDir = __dirname;
    const projectPath = path.join(tmpDir, 'tmp-project.json');
    const generatedPath = path.join(tmpDir, 'tmp-generated.md');
    const markdownPath = path.join(tmpDir, 'tmp-readme.md');

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
        safeUnlink(markdownPath);
        consoleSpy.mockRestore();
    });

    test('fails if generated file missing', async () => {

        fs.writeFileSync(markdownPath, 'README', 'utf-8');

        const result = await runExecutor(
            {
                projectJsonPath: projectPath,
                mode: 'inject',
                generatedMermaidPath: generatedPath,
                markdownPath
            }
        );

        expect(result.success).toBe(false);
        expect(consoleSpy).toHaveBeenCalledWith(
            `Generated file not found at: ${generatedPath}`
        );
    });

    test('fails if markdown file missing', async () => {

        fs.writeFileSync(generatedPath, `${'```mermaid'}\ngraph TD\n\n${'```'}`, 'utf-8');

        const result = await runExecutor(
            {
                projectJsonPath: projectPath,
                mode: 'inject',
                generatedMermaidPath: generatedPath,
                markdownPath
            }
        );

        expect(result.success).toBe(false);
        expect(consoleSpy).toHaveBeenCalledWith(
            `Markdown file not found at: ${markdownPath}`
        );
    });

    test('fails if NX_GRAPH markers missing', async () => {

        fs.writeFileSync(generatedPath, `${'```mermaid'}\ngraph TD\n\n${'```'}`, 'utf-8');
        fs.writeFileSync(markdownPath, 'NO MARKERS HERE', 'utf-8');

        const result = await runExecutor(
            {
                projectJsonPath: projectPath,
                mode: 'inject',
                generatedMermaidPath: generatedPath,
                markdownPath
            }
        );

        expect(result.success).toBe(false);
        expect(consoleSpy).toHaveBeenCalledWith(
            'NX_GRAPH markers not found or invalid'
        );
    });

    test('replaces only content between markers', async () => {

        const generatedContent = `${'```mermaid'}\ngraph TD\n\n  build\n\n${'```'}`;
        fs.writeFileSync(generatedPath, generatedContent, 'utf-8');

        fs.writeFileSync(
            markdownPath,
            `
# Title

<!-- NX_GRAPH:START -->
OLD CONTENT
<!-- NX_GRAPH:END -->

Footer
`,
            'utf-8'
        );

        const result = await runExecutor(
            {
                projectJsonPath: projectPath,
                mode: 'inject',
                generatedMermaidPath: generatedPath,
                markdownPath
            }
        );

        expect(result.success).toBe(true);

        const updated = fs.readFileSync(markdownPath, 'utf-8');

        expect(updated).toContain(generatedContent);
        expect(updated).toContain('# Title');
        expect(updated).toContain('Footer');
        expect(updated).not.toContain('OLD CONTENT');
    });



    // Note: in inject mode we don't really need content of project.json file because mark up already generated.
    test('inject mode is idempotent', async () => {

        const generatedContent = `${'```mermaid'}\ngraph TD\n\n  build\n\n${'```'}`;
        fs.writeFileSync(generatedPath, generatedContent, 'utf-8');

        fs.writeFileSync(
            markdownPath,
            `
# Title

<!-- NX_GRAPH:START -->
OLD CONTENT
<!-- NX_GRAPH:END -->

Footer
`,
            'utf-8'
        );

        // First injection
        await runExecutor(
            {
                projectJsonPath: projectPath,
                mode: 'inject',
                generatedMermaidPath: generatedPath,
                markdownPath
            }
        );

        const first = fs.readFileSync(markdownPath, 'utf-8');

        // Second injection
        await runExecutor(
            {
                projectJsonPath: projectPath,
                mode: 'inject',
                generatedMermaidPath: generatedPath,
                markdownPath
            }
        );

        const second = fs.readFileSync(markdownPath, 'utf-8');

        expect(first).toBe(second);
    });



});
