const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { spawnSync } = require('node:child_process');

// When PUBLISHED_VERSION is set, test against the published npm package.
// Otherwise test against the local binary.
const PUBLISHED_VERSION = process.env.PUBLISHED_VERSION;
const LOCAL_BIN = path.resolve(__dirname, '../bin/autogen-markdown-doc.js');

function runBin(args, cwd) {
    if (PUBLISHED_VERSION) {
        return spawnSync(
            'npx',
            ['--yes', `@datalackey/autogen-markdown-doc@${PUBLISHED_VERSION}`, ...args],
            { encoding: 'utf-8', cwd: cwd }
        );
    }
    return spawnSync('node', [LOCAL_BIN, ...args], { encoding: 'utf-8', cwd: cwd });
}

describe('autogen-markdown-doc integration', () => {

    let tmpDir;
    let projectPath;
    let markdownPath;

    beforeAll(() => {
        tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'autogen-'));
        projectPath = path.join(tmpDir, 'project.json');
        markdownPath = path.join(tmpDir, 'README.md');

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
            `# My Project

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

    test('updates Mermaid graph and TOC when --project-json provided', () => {
        const result = runBin(['--project-json', projectPath, markdownPath], tmpDir);

        if (result.status !== 0) {
            throw new Error(
                `bin exited ${result.status}\nstdout: ${result.stdout}\nstderr: ${result.stderr}`
            );
        }
        expect(result.status).toBe(0);

        const updated = fs.readFileSync(markdownPath, 'utf-8');

        expect(updated).toContain('```mermaid');
        expect(updated).toContain('graph TD');
        expect(updated).not.toContain('OLD GRAPH');
        expect(updated).toContain('- [Section A]');
    });

    test('updates TOC only when --project-json omitted', () => {
        const tocOnlyPath = path.join(tmpDir, 'toc-only.md');

        fs.writeFileSync(           // mermaid graph tags included -- they should be ignored
            tocOnlyPath,
            `# TOC Only

<!-- TOC:START -->
<!-- TOC:END -->

## Alpha

## Beta

<!-- NX_GRAPH:START -->
<!-- NX_GRAPH:END -->

`,
            'utf-8'
        );

        const result = runBin([tocOnlyPath], tmpDir);
        if (result.status !== 0) {
            throw new Error(
                `bin exited ${result.status}\nstdout: ${result.stdout}\nstderr: ${result.stderr}`
            );
        }
        expect(result.status).toBe(0);


        const updated = fs.readFileSync(tocOnlyPath, 'utf-8');

        expect(updated).toContain('- [Alpha](#alpha)');
        expect(updated).toContain('- [Beta](#beta)');
    });
});