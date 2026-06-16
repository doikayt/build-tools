import { describe, test, expect, beforeAll, afterAll } from "vitest";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const FIXTURE_DIR = path.resolve(__dirname, "fixtures/math-cli-nx");
const AUTOGEN_PACKAGE_DIR = path.resolve(__dirname, "../../");
const TOOLING_CORE_DIR = path.resolve(__dirname, "../../../tooling-core");
const UPDATE_MARKDOWN_TOC_DIR = path.resolve(
  __dirname,
  "../../../update-markdown-toc"
);
const NX_GRAPH_TO_MERMAID_DIR = path.resolve(
  __dirname,
  "../../../nx-graph-to-mermaid"
);
const UPDATE_MARKDOWN_UML_DIR = path.resolve(
  __dirname,
  "../../../update-markdown-uml"
);

const AUTOGEN_BIN_REL = path.join(
  "node_modules",
  "@datalackey",
  "autogen-markdown-doc",
  "bin",
  "autogen-markdown-doc.js"
);

let workDir: string;
let packDir: string;

function npmPack(packageDir: string, dest: string): string {
  // --ignore-scripts: skip the package's `prepack` hook. NX's `dependsOn` already
  // guarantees a fresh dist/ before this test runs; without --ignore-scripts, prepack
  // would redundantly `rm -rf dist` + rebuild here, racing against sibling tasks reading
  // that same dist/ via the npm workspace symlink.
  const result = spawnSync(
    "npm",
    ["pack", "--json", "--ignore-scripts", "--pack-destination", dest],
    { cwd: packageDir, encoding: "utf-8" }
  );
  if (result.status !== 0) {
    throw new Error(`npm pack failed in ${packageDir}:\n${result.stderr}`);
  }
  const parsed = JSON.parse(result.stdout) as Array<{ filename: string }>;
  return path.join(dest, parsed[0].filename);
}

function copyDir(src: string, dest: string): void {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

beforeAll(() => {
  packDir = fs.mkdtempSync(path.join(os.tmpdir(), "autogen-packs-"));

  const coreTarball = npmPack(TOOLING_CORE_DIR, packDir);
  const tocTarball = npmPack(UPDATE_MARKDOWN_TOC_DIR, packDir);
  const nxTarball = npmPack(NX_GRAPH_TO_MERMAID_DIR, packDir);
  const umlTarball = npmPack(UPDATE_MARKDOWN_UML_DIR, packDir);
  const autogenTarball = npmPack(AUTOGEN_PACKAGE_DIR, packDir);

  workDir = fs.mkdtempSync(path.join(os.tmpdir(), "autogen-e2e-"));

  fs.writeFileSync(
    path.join(workDir, "package.json"),
    JSON.stringify({
      name: "math-cli-nx-e2e",
      version: "1.0.0",
      type: "module",
    }),
    "utf-8"
  );

  const install = spawnSync(
    "npm",
    ["install", coreTarball, tocTarball, nxTarball, umlTarball, autogenTarball],
    { cwd: workDir, encoding: "utf-8" }
  );
  if (install.status !== 0) {
    throw new Error(`npm install failed:\n${install.stderr}`);
  }

  copyDir(path.join(FIXTURE_DIR, "src"), path.join(workDir, "src"));
  fs.copyFileSync(
    path.join(FIXTURE_DIR, "project.json"),
    path.join(workDir, "project.json")
  );
}, 120_000);

afterAll(() => {
  if (workDir) fs.rmSync(workDir, { recursive: true, force: true });
  if (packDir) fs.rmSync(packDir, { recursive: true, force: true });
});

function writeReadme(): void {
  fs.copyFileSync(
    path.join(FIXTURE_DIR, "README.md"),
    path.join(workDir, "README.md")
  );
}

function runBinary(args: string[]): {
  exitCode: number;
  stdout: string;
  stderr: string;
} {
  const bin = path.join(workDir, AUTOGEN_BIN_REL);
  const result = spawnSync("node", [bin, ...args], {
    cwd: workDir,
    encoding: "utf-8",
  });
  return {
    exitCode: result.status ?? 1,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
  };
}

describe("Math CLI example from README: invoke both Uber plugin and bundled plugin scenarios", () => {
  test("update mode injects TOC, NX graph, and UML content", () => {
    writeReadme();

    const { exitCode, stdout, stderr } = runBinary(["README.md"]);
    if (exitCode !== 0) {
      throw new Error(
        `bin exited ${exitCode}\nstdout: ${stdout}\nstderr: ${stderr}`
      );
    }
    expect(exitCode).toBe(0);

    const content = fs.readFileSync(path.join(workDir, "README.md"), "utf-8");

    // TOC: heading entries were injected
    expect(content).toContain("- [Math CLI](#math-cli)");
    expect(content).toContain("- [Build Pipeline](#build-pipeline)");
    expect(content).toContain("- [Usage](#usage)");

    // TOC: UML runs before TOC, so component headings it injects
    // (#### cli, #### math-engine) are already present for TOC to pick up
    // on this single pass — no second update is needed for convergence.
    expect(content).toContain("- [cli](#cli)");
    expect(content).toContain("- [math-engine](#math-engine)");

    // NX graph: mermaid block with pipeline targets
    expect(content).toContain("```mermaid");
    expect(content).toContain("graph TD");
    expect(content).toContain("build");
    expect(content).toContain("lint");
    expect(content).toContain("test");
    expect(content).toContain("e2e");

    // UML component overview: both components with dependency arrow
    expect(content).toContain('subgraph cli["cli"]');
    expect(content).toContain('subgraph math-engine["math-engine"]');
    expect(content).toContain("cli --> math-engine");

    // UML components table: linked rows with descriptions
    expect(content).toContain("| [cli](#cli) | Command-line interface layer");
    expect(content).toContain(
      "| [math-engine](#math-engine) | Code for System Backend"
    );

    // UML class diagrams: representative types from each component
    expect(content).toContain("classDiagram");
    expect(content).toContain("MathEngine");
    expect(content).toContain("MathError");
    expect(content).toContain("AddCommand");
    expect(content).toContain("CliRunner");
  });

  test("check mode exits 0 after a single update (UML runs before TOC, so TOC converges in one pass)", () => {
    writeReadme();
    runBinary(["README.md"]); // single pass: UML injects headings, then TOC picks them up

    const { exitCode } = runBinary(["check", "README.md"]);
    expect(exitCode).toBe(0);
  });

  test("check mode exits 1 when markers are empty (stale)", () => {
    writeReadme();

    const { exitCode } = runBinary(["check", "README.md"]);
    expect(exitCode).toBe(1);
  });
});

function pluginBin(packageName: string, binName: string): string {
  return path.join(
    workDir,
    "node_modules",
    "@datalackey",
    packageName,
    "bin",
    binName
  );
}

function runPlugin(
  bin: string,
  args: string[]
): { exitCode: number; stdout: string; stderr: string } {
  const result = spawnSync("node", [bin, ...args], {
    cwd: workDir,
    encoding: "utf-8",
  });
  return {
    exitCode: result.status ?? 1,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
  };
}

describe("Using Bundled Plugins Independently (README scenarios)", () => {
  test("update-markdown-toc standalone — single file", () => {
    writeReadme();
    const tocBin = pluginBin("update-markdown-toc", "update-markdown-toc.js");

    const { exitCode } = runPlugin(tocBin, ["README.md"]);
    expect(exitCode).toBe(0);

    const content = fs.readFileSync(path.join(workDir, "README.md"), "utf-8");
    expect(content).toContain("- [Math CLI](#math-cli)");
    expect(content).toContain("- [Usage](#usage)");
  });

  test("update-markdown-toc standalone — recursive over a folder", () => {
    const docsDir = path.join(workDir, "docs");
    fs.mkdirSync(docsDir, { recursive: true });
    fs.writeFileSync(
      path.join(docsDir, "guide.md"),
      "<!-- TOC:START -->\n<!-- TOC:END -->\n\n## Installation\n\n## Usage\n",
      "utf-8"
    );
    const tocBin = pluginBin("update-markdown-toc", "update-markdown-toc.js");

    const { exitCode } = runPlugin(tocBin, ["--recursive", "docs/"]);
    expect(exitCode).toBe(0);

    const content = fs.readFileSync(path.join(docsDir, "guide.md"), "utf-8");
    expect(content).toContain("- [Installation](#installation)");
    expect(content).toContain("- [Usage](#usage)");
  });

  test("update-markdown-uml standalone — single file", () => {
    writeReadme();
    const umlBin = pluginBin("update-markdown-uml", "update-markdown-uml.js");

    const { exitCode } = runPlugin(umlBin, ["README.md"]);
    expect(exitCode).toBe(0);

    const content = fs.readFileSync(path.join(workDir, "README.md"), "utf-8");
    expect(content).toContain('subgraph cli["cli"]');
    expect(content).toContain('subgraph math-engine["math-engine"]');
    expect(content).toContain("classDiagram");
  });

  test("update-markdown-uml standalone — with --exclude-packages", () => {
    writeReadme();
    const umlBin = pluginBin("update-markdown-uml", "update-markdown-uml.js");

    const { exitCode } = runPlugin(umlBin, [
      "--exclude-packages",
      "math-engine",
      "README.md",
    ]);
    expect(exitCode).toBe(0);

    const content = fs.readFileSync(path.join(workDir, "README.md"), "utf-8");
    expect(content).toContain('subgraph cli["cli"]');
    expect(content).not.toContain('subgraph math-engine["math-engine"]');
  });

  test("update-markdown-uml via uber plugin — with --exclude-packages forwarded from autogen-markdown-doc", () => {
    writeReadme();

    const { exitCode } = runBinary([
      "update",
      "--exclude-packages",
      "math-engine",
      "README.md",
    ]);
    expect(exitCode).toBe(0);

    const content = fs.readFileSync(path.join(workDir, "README.md"), "utf-8");
    expect(content).toContain('subgraph cli["cli"]');
    expect(content).not.toContain('subgraph math-engine["math-engine"]');
  });

  test("CI drift check — update-markdown-toc standalone", () => {
    writeReadme();
    const tocBin = pluginBin("update-markdown-toc", "update-markdown-toc.js");

    runPlugin(tocBin, ["README.md"]);
    const { exitCode } = runPlugin(tocBin, ["--check", "README.md"]);
    expect(exitCode).toBe(0);
  });

  test("CI drift check — update-markdown-uml standalone", () => {
    writeReadme();
    const umlBin = pluginBin("update-markdown-uml", "update-markdown-uml.js");

    runPlugin(umlBin, ["README.md"]);
    const { exitCode } = runPlugin(umlBin, ["--check", "README.md"]);
    expect(exitCode).toBe(0);
  });
});
