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
  const result = spawnSync(
    "npm",
    ["pack", "--json", "--pack-destination", dest],
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

describe("math-cli-nx uber e2e", () => {
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

  test("check mode exits 0 after two updates (UML injects headings that TOC must pick up on second pass)", () => {
    writeReadme();
    runBinary(["README.md"]); // first pass: TOC, NX graph, UML injected
    runBinary(["README.md"]); // second pass: TOC picks up headings injected by UML

    const { exitCode } = runBinary(["check", "README.md"]);
    expect(exitCode).toBe(0);
  });

  test("check mode exits 1 when markers are empty (stale)", () => {
    writeReadme();

    const { exitCode } = runBinary(["check", "README.md"]);
    expect(exitCode).toBe(1);
  });
});
