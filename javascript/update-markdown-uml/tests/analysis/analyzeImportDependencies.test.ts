import { describe, test, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { analyzeImportDependencies } from "../../src/analysis/analyzeImportDependencies.js";

const CLI = "cli";
const REPOSITORY = "repository";
const UTIL = "util";

let tmpDir: string;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "analyze-deps-"));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

function write(relPath: string, content: string): void {
  const full = path.join(tmpDir, relPath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, "utf-8");
}

function leafDir(name: string): string {
  return path.join(tmpDir, name);
}

describe("analyzeImportDependencies()", () => {
  test("transitive edges appear in output", () => {
    write(`${CLI}/index.ts`, `import { x } from "../${REPOSITORY}/types.js";`);
    write(
      `${REPOSITORY}/types.ts`,
      `import { y } from "../${UTIL}/helpers.js";`
    );
    write(`${UTIL}/helpers.ts`, "export const y = 1;");
    const result = analyzeImportDependencies(
      [leafDir(CLI), leafDir(REPOSITORY), leafDir(UTIL)],
      tmpDir
    );
    expect(result).toContainEqual({ from: CLI, to: REPOSITORY });
    expect(result).toContainEqual({ from: CLI, to: UTIL });
    expect(result).toContainEqual({ from: REPOSITORY, to: UTIL });
  }, 15000);
});
