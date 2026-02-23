const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { execSync } = require('node:child_process');

describe('autogen-markdown-doc integration', () => {

    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'autogen-'));
    const projectPath = path.join(tmpDir, 'project.json');
    const markdownPath = path.join(tmpDir, 'README.md');

    beforeAll(() => {

        fs.writeFileSync(
            projectPath,
            JSON.stringify({
                targets: {
                    build: { description: 'Compile source' },
                    lint: {}
                }
            }),
            'utf-8'
        );

        fs.writeFileSync(
            markdownPath,
`
# My Project

<!-- TOC:START -->
<!-- TOC:END -->

<!-- NX_GRAPH:START -->
OLD GRAPH
<!-- NX_GRAPH:END -->

## Section A
`,
            'utf-8'
        );
    });

    test.skip('updates Mermaid graph and TOC', () => {

        execSync(
            `node ./bin/autogen-markdown-doc.js ${projectPath} ${markdownPath}`,
            {
                cwd: path.resolve(__dirname, '..'),
                stdio: 'inherit'
            }
        );

        const updated = fs.readFileSync(markdownPath, 'utf-8');

        expect(updated).toContain('```mermaid');
        expect(updated).toContain('graph TD');
        expect(updated).not.toContain('OLD GRAPH');

        expect(updated).toContain('- [Section A]');
    });
});
