import { describe, test, expect, beforeAll, afterAll } from "vitest";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const FIXTURE_DIR = path.resolve(__dirname, "../e2e/fixtures/math-cli-nx");

const PUBLISHED_VERSION = process.env.PUBLISHED_VERSION;

const AUTOGEN_BIN_REL = path.join(
  "node_modules",
  "@doikayt",
  "autogen-markdown-doc",
  "bin",
  "autogen-markdown-doc.js"
);

let workDir: string;

beforeAll(() => {
  if (!PUBLISHED_VERSION) return;

  workDir = fs.mkdtempSync(path.join(os.tmpdir(), "autogen-smoke-"));

  fs.writeFileSync(
    path.join(workDir, "package.json"),
    JSON.stringify({ name: "smoke-test", version: "1.0.0", type: "module" }),
    "utf-8"
  );

  const install = spawnSync(
    "npm",
    ["install", `@doikayt/autogen-markdown-doc@${PUBLISHED_VERSION}`],
    { cwd: workDir, encoding: "utf-8" }
  );
  if (install.status !== 0) {
    throw new Error(
      `npm install @doikayt/autogen-markdown-doc@${PUBLISHED_VERSION} failed:\n${install.stderr}`
    );
  }

  // Copy fixture files needed by the binary (src/ for UML, project.json for NX graph)
  const srcDest = path.join(workDir, "src");
  fs.mkdirSync(srcDest, { recursive: true });
  for (const entry of fs.readdirSync(path.join(FIXTURE_DIR, "src"), {
    withFileTypes: true,
  })) {
    const src = path.join(FIXTURE_DIR, "src", entry.name);
    const dest = path.join(srcDest, entry.name);
    if (entry.isDirectory()) {
      fs.cpSync(src, dest, { recursive: true });
    } else {
      fs.copyFileSync(src, dest);
    }
  }
  fs.copyFileSync(
    path.join(FIXTURE_DIR, "project.json"),
    path.join(workDir, "project.json")
  );
}, 180_000);

afterAll(() => {
  if (workDir) fs.rmSync(workDir, { recursive: true, force: true });
});

describe(`Post-publish smoke test — @doikayt/autogen-markdown-doc`, () => {
  test("skip if PUBLISHED_VERSION env var is not set", () => {
    if (!PUBLISHED_VERSION) {
      console.log(
        "PUBLISHED_VERSION not set — skipping post-publish smoke test. " +
          "Set PUBLISHED_VERSION=<version> to run against a published npm release."
      );
      return;
    }
    expect(PUBLISHED_VERSION).toBeTruthy();
  });

  test("installs from npm registry and binary runs successfully", () => {
    if (!PUBLISHED_VERSION) return;

    fs.copyFileSync(
      path.join(FIXTURE_DIR, "README.md"),
      path.join(workDir, "README.md")
    );

    const bin = path.join(workDir, AUTOGEN_BIN_REL);
    const result = spawnSync("node", [bin, "README.md"], {
      cwd: workDir,
      encoding: "utf-8",
    });

    if (result.status !== 0) {
      throw new Error(
        `autogen-markdown-doc@${PUBLISHED_VERSION} exited ${result.status}\n` +
          `stdout: ${result.stdout}\nstderr: ${result.stderr}`
      );
    }

    expect(result.status).toBe(0);
  });

  test("TOC, NX graph, and UML content are all injected", () => {
    if (!PUBLISHED_VERSION) return;

    const content = fs.readFileSync(path.join(workDir, "README.md"), "utf-8");

    // TOC
    expect(content).toContain("- [Math CLI](#math-cli)");
    expect(content).toContain("- [Build Pipeline](#build-pipeline)");

    // NX graph
    expect(content).toContain("```mermaid");
    expect(content).toContain("graph TD");

    // UML
    expect(content).toContain('subgraph cli["cli"]');
    expect(content).toContain('subgraph math-engine["math-engine"]');
    expect(content).toContain("classDiagram");
  });

  test("check mode exits 0 after a single update pass", () => {
    if (!PUBLISHED_VERSION) return;

    const bin = path.join(workDir, AUTOGEN_BIN_REL);
    const result = spawnSync("node", [bin, "check", "README.md"], {
      cwd: workDir,
      encoding: "utf-8",
    });

    expect(result.status).toBe(0);
  });
});
