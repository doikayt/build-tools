const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const { spawnSync } = require("node:child_process");

// When PUBLISHED_VERSION is set, test against the published npm package.
// Otherwise test against the local binary.
const PUBLISHED_VERSION = process.env.PUBLISHED_VERSION;
const LOCAL_BIN = path.resolve(__dirname, "../bin/autogen-markdown-doc.js");

function runBin(args, cwd) {
  if (PUBLISHED_VERSION) {
    return spawnSync(
      "npx",
      [
        "--yes",
        "--package",
        `@datalackey/autogen-markdown-doc@${PUBLISHED_VERSION}`,
        "autogen-markdown-doc",
        ...args,
      ],
      { encoding: "utf-8", cwd: cwd }
    );
  }
  return spawnSync("node", [LOCAL_BIN, ...args], {
    encoding: "utf-8",
    cwd: cwd,
  });
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeTmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "autogen-"));
}

function writeFile(dir, name, content) {
  const fullPath = path.join(dir, name);
  fs.writeFileSync(fullPath, content, "utf-8");
  return fullPath;
}

function readFile(filePath) {
  return fs.readFileSync(filePath, "utf-8");
}

// ---------------------------------------------------------------------------
// Marker helpers
// ---------------------------------------------------------------------------

const TOC_ONLY_MD = `# My Project

<!-- TOC:START -->
<!-- TOC:END -->

## Section A
`;

const TOC_AND_NX_MD = `# My Project

<!-- TOC:START -->
<!-- TOC:END -->

<!-- NX_GRAPH:START -->
OLD GRAPH
<!-- NX_GRAPH:END -->

## Section A
`;

const NX_ONLY_MD = `# My Project

<!-- NX_GRAPH:START -->
<!-- NX_GRAPH:END -->
`;

const NO_MARKERS_MD = `# My Project

Just plain text, no markers here.
`;

const MALFORMED_TOC_MD = `# My Project

<!-- TOC:START -->
No closing tag.

## Section A
`;

const STALE_TOC_MD = `# My Project

<!-- TOC:START -->
- [Wrong Entry](#wrong-entry)
<!-- TOC:END -->

## Correct Section
`;

const CORRECT_TOC_MD = `# My Project

<!-- TOC:START -->
- [My Project](#my-project)
  - [Correct Section](#correct-section)
<!-- TOC:END -->

## Correct Section
`;

const PROJECT_JSON = JSON.stringify({
  targets: {
    build: { description: "Compile source" },
    lint: {},
  },
});

// ---------------------------------------------------------------------------
// Tests: flag behaviors
// ---------------------------------------------------------------------------

describe("--help flag", () => {
  let tmpDir;
  beforeEach(() => {
    tmpDir = makeTmpDir();
  });
  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  test("prints usage to stdout and exits 0", () => {
    const result = runBin(["--help"], tmpDir);
    expect(result.status).toBe(0);
    expect(result.stdout).toContain("--quiet");
    expect(result.stdout).toContain("--debug");
    expect(result.stdout).toContain("--exclude-packages");
    expect(result.stdout).toContain("update");
    expect(result.stdout).toContain("check");
  });
});

describe("--debug flag", () => {
  let tmpDir;
  beforeEach(() => {
    tmpDir = makeTmpDir();
  });
  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  test("emits [autogen] plugin-selection lines on stderr", () => {
    const mdPath = writeFile(tmpDir, "README.md", TOC_ONLY_MD);
    const result = runBin(["--debug", mdPath], tmpDir);
    expect(result.status).toBe(0);
    expect(result.stderr).toContain("[autogen]");
  });
});

// ---------------------------------------------------------------------------
// Tests: no markers warning
// ---------------------------------------------------------------------------

describe("no markers", () => {
  let tmpDir;
  beforeEach(() => {
    tmpDir = makeTmpDir();
  });
  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  test("emits warning on stderr and exits 0 without --quiet", () => {
    const mdPath = writeFile(tmpDir, "README.md", NO_MARKERS_MD);
    const result = runBin([mdPath], tmpDir);
    expect(result.status).toBe(0);
    expect(result.stderr).toContain("no recognized markers");
  });

  test("emits no output and exits 0 with --quiet", () => {
    const mdPath = writeFile(tmpDir, "README.md", NO_MARKERS_MD);
    const result = runBin(["--quiet", mdPath], tmpDir);
    expect(result.status).toBe(0);
    expect(result.stdout).toBe("");
    expect(result.stderr).toBe("");
  });
});

// ---------------------------------------------------------------------------
// Tests: file resolution
// ---------------------------------------------------------------------------

describe("file resolution", () => {
  let tmpDir;
  beforeEach(() => {
    tmpDir = makeTmpDir();
  });
  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  test("uses README.md in cwd when no file positional provided", () => {
    writeFile(tmpDir, "README.md", TOC_ONLY_MD);
    const result = runBin([], tmpDir);
    expect(result.status).toBe(0);
  });

  test("exits 1 with error when no file positional and no README.md in cwd", () => {
    const result = runBin([], tmpDir);
    expect(result.status).toBe(1);
    expect(result.stderr).toMatch(/not found/i);
  });

  test("exits 1 with error when the specified file does not exist", () => {
    const result = runBin([path.join(tmpDir, "nonexistent.md")], tmpDir);
    expect(result.status).toBe(1);
    expect(result.stderr).toMatch(/not found/i);
  });
});

// ---------------------------------------------------------------------------
// Tests: malformed markers
// ---------------------------------------------------------------------------

describe("malformed markers", () => {
  let tmpDir;
  beforeEach(() => {
    tmpDir = makeTmpDir();
  });
  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  test("exits 1 when START is present without matching END", () => {
    const mdPath = writeFile(tmpDir, "README.md", MALFORMED_TOC_MD);
    const result = runBin([mdPath], tmpDir);
    expect(result.status).toBe(1);
    expect(result.stderr).toMatch(/ERROR/);
  });

  test("malformed marker error is NOT suppressed by --quiet", () => {
    const mdPath = writeFile(tmpDir, "README.md", MALFORMED_TOC_MD);
    const result = runBin(["--quiet", mdPath], tmpDir);
    expect(result.status).toBe(1);
    expect(result.stderr).toMatch(/ERROR/);
  });
});

// ---------------------------------------------------------------------------
// Tests: NX_GRAPH auto-discovery
// ---------------------------------------------------------------------------

describe("NX_GRAPH markers", () => {
  let tmpDir;
  beforeEach(() => {
    tmpDir = makeTmpDir();
  });
  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  test("exits 1 with error when NX_GRAPH markers present but no project.json in file directory", () => {
    const mdPath = writeFile(tmpDir, "README.md", NX_ONLY_MD);
    const result = runBin([mdPath], tmpDir);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("NX_GRAPH");
    expect(result.stderr).toContain("project.json");
  });

  test("updates Mermaid graph and TOC when project.json is co-located with file", () => {
    const mdPath = writeFile(tmpDir, "README.md", TOC_AND_NX_MD);
    writeFile(tmpDir, "project.json", PROJECT_JSON);

    const result = runBin([mdPath], tmpDir);

    if (result.status !== 0) {
      throw new Error(
        `bin exited ${result.status}\nstdout: ${result.stdout}\nstderr: ${result.stderr}`
      );
    }
    expect(result.status).toBe(0);

    const updated = readFile(mdPath);
    expect(updated).toContain("```mermaid");
    expect(updated).toContain("graph TD");
    expect(updated).not.toContain("OLD GRAPH");
    expect(updated).toContain("- [Section A]");
  });
});

// ---------------------------------------------------------------------------
// Tests: TOC-only (no Mermaid markers)
// ---------------------------------------------------------------------------

describe("TOC-only update", () => {
  let tmpDir;
  beforeEach(() => {
    tmpDir = makeTmpDir();
  });
  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  test("updates TOC when only TOC markers are present (no project.json needed)", () => {
    const mdPath = writeFile(tmpDir, "README.md", TOC_ONLY_MD);
    const result = runBin([mdPath], tmpDir);

    expect(result.status).toBe(0);
    const updated = readFile(mdPath);
    expect(updated).toContain("- [Section A](#section-a)");
  });
});

// ---------------------------------------------------------------------------
// Tests: check subcommand
// ---------------------------------------------------------------------------

describe("check subcommand", () => {
  let tmpDir;
  beforeEach(() => {
    tmpDir = makeTmpDir();
  });
  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  test("exits 0 on a file that is already up to date", () => {
    const mdPath = writeFile(tmpDir, "README.md", CORRECT_TOC_MD);
    const result = runBin(["check", mdPath], tmpDir);
    expect(result.status).toBe(0);
  });

  test("exits 1 on a file with a stale TOC", () => {
    const mdPath = writeFile(tmpDir, "README.md", STALE_TOC_MD);
    const result = runBin(["check", mdPath], tmpDir);
    expect(result.status).toBe(1);
  });

  test("exits 0 after update makes a stale file current", () => {
    const mdPath = writeFile(tmpDir, "README.md", STALE_TOC_MD);
    runBin([mdPath], tmpDir);
    const result = runBin(["check", mdPath], tmpDir);
    expect(result.status).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Tests: --exclude-packages forwarding
// ---------------------------------------------------------------------------

describe("--exclude-packages", () => {
  let tmpDir;
  beforeEach(() => {
    tmpDir = makeTmpDir();
  });
  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  test("is accepted without error and TOC still succeeds (not forwarded to TOC)", () => {
    // The TOC plugin would fail with "Unknown option" if it received --exclude-packages.
    // Exiting 0 here confirms the flag was only forwarded to UML.
    const mdPath = writeFile(tmpDir, "README.md", TOC_ONLY_MD);
    const result = runBin(["--exclude-packages", "legacy", mdPath], tmpDir);
    expect(result.status).toBe(0);
  });
});
