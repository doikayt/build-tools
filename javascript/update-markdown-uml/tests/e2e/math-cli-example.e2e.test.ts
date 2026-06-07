import { describe, test, expect, beforeAll, afterAll } from "vitest";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const FIXTURE_DIR = path.resolve(__dirname, "fixtures/math-cli");
const UML_PACKAGE_DIR = path.resolve(__dirname, "../../");
const TOOLING_CORE_DIR = path.resolve(__dirname, "../../../tooling-core");
const UML_BIN_REL = path.join(
  "node_modules",
  "@datalackey",
  "update-markdown-uml",
  "bin",
  "update-markdown-uml.js"
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
  packDir = fs.mkdtempSync(path.join(os.tmpdir(), "uml-packs-"));
  const coreTarball = npmPack(TOOLING_CORE_DIR, packDir);
  const umlTarball = npmPack(UML_PACKAGE_DIR, packDir);

  workDir = fs.mkdtempSync(path.join(os.tmpdir(), "uml-e2e-"));

  fs.writeFileSync(
    path.join(workDir, "package.json"),
    JSON.stringify({ name: "math-cli-e2e", version: "1.0.0", type: "module" }),
    "utf-8"
  );

  const install = spawnSync(
    "npm",
    ["install", coreTarball, umlTarball],
    { cwd: workDir, encoding: "utf-8" }
  );
  if (install.status !== 0) {
    throw new Error(`npm install failed:\n${install.stderr}`);
  }

  copyDir(path.join(FIXTURE_DIR, "src"), path.join(workDir, "src"));
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

function runBinary(
  args: string[]
): { exitCode: number; stdout: string; stderr: string } {
  const bin = path.join(workDir, UML_BIN_REL);
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

describe("math-cli-example e2e", () => {
  test("update mode injects mermaid content for both packages", () => {
    writeReadme();

    const { exitCode } = runBinary(["README.md"]);
    expect(exitCode).toBe(0);

    const content = fs.readFileSync(path.join(workDir, "README.md"), "utf-8");

    // flowchart overview with both packages present
    expect(content).toContain('subgraph cli["cli"]');
    expect(content).toContain('subgraph math-engine["math-engine"]');
    // cross-package dependency arrow
    expect(content).toContain("cli --> math-engine");

    // packages table with clickable links
    expect(content).toContain("| [cli](#cli) |");
    expect(content).toContain("| [math-engine](#math-engine) |");

    // class diagrams with representative types from each package
    expect(content).toContain("classDiagram");
    expect(content).toContain("MathEngine");
    expect(content).toContain("MathError");
    expect(content).toContain("AddCommand");
    expect(content).toContain("CliRunner");
  });

  test("check mode exits 0 immediately after update", () => {
    writeReadme();
    runBinary(["README.md"]);

    const { exitCode } = runBinary(["--check", "README.md"]);
    expect(exitCode).toBe(0);
  });

  test("check mode exits 1 when markers are empty (stale)", () => {
    writeReadme();

    const { exitCode } = runBinary(["--check", "README.md"]);
    expect(exitCode).toBe(1);
  });
});
