const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { execSync, spawnSync } = require('node:child_process');

const BIN = path.resolve(__dirname, '../bin/autogen-markdown-doc.js');

describe('autogen-markdown-doc — optional --project-json', () => {

    let tmpDir;
    let markdownPath;

    beforeEach(() => {
        tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'autogen-optional-'));

        fs.writeFileSync(
            path.join(tmpDir, 'README.md'),
            `# My Project

<!-- TOC:START -->
<!-- TOC:END -->

## Section A
`,
            'utf-8'
        );

        markdownPath = path.join(tmpDir, 'README.md');
    });

    afterEach(() => {
        fs.rmSync(tmpDir, { recursive: true, force: true });
    });

    test('exits 0 when --project-json is omitted', () => {
        const result = spawnSync(
            'node',
            [BIN, markdownPath],
            { encoding: 'utf-8' }
        );

        expect(result.status).toBe(0);
    });

    test('updates TOC when --project-json is omitted', () => {
        spawnSync('node', [BIN, markdownPath], { encoding: 'utf-8' });

        const updated = fs.readFileSync(markdownPath, 'utf-8');
        expect(updated).toContain('- [Section A]');
    });

    test('update-markdown-uml stub still runs when --project-json is omitted', () => {
            const output = execSync(
                `node "${BIN}" "${markdownPath}"`,
                { encoding: 'utf-8' }
            );

            expect(output).toContain('autogen-markdown-doc: update complete');
        });

    test('exits non-zero when markdown file argument is missing entirely', () => {
        const result = spawnSync('node', [BIN], { encoding: 'utf-8' });
        expect(result.status).not.toBe(0);
    });

    test('--project-json still works when provided', () => {
        const projectPath = path.join(tmpDir, 'project.json');
        fs.writeFileSync(
            projectPath,
            JSON.stringify({
                targets: {
                    build: { description: 'Compile source' }
                }
            }),
            'utf-8'
        );

        // Add NX_GRAPH markers so injection has a target
        fs.writeFileSync(
            markdownPath,
            `# My Project

<!-- TOC:START -->
<!-- TOC:END -->

<!-- NX_GRAPH:START -->
<!-- NX_GRAPH:END -->

## Section A
`,
            'utf-8'
        );

        const result = spawnSync(
            'node',
            [BIN, '--project-json', projectPath, markdownPath],
            { encoding: 'utf-8' }
        );

        expect(result.status).toBe(0);

        const updated = fs.readFileSync(markdownPath, 'utf-8');
        expect(updated).toContain('```mermaid');
    });

});
