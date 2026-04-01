import { describe, test, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { analyzeImportDependencies } from "../../src/analysis/analyzeImportDependencies.js";

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
    write("cli/index.ts", 'import { x } from "../repository/types.js";');
    write("repository/types.ts", 'import { y } from "../util/helpers.js";');
    write("util/helpers.ts", "export const y = 1;");

    const result = analyzeImportDependencies(
      [leafDir("cli"), leafDir("repository"), leafDir("util")],
      tmpDir
    );

    expect(result).toContainEqual({ from: "cli", to: "repository" });
    expect(result).toContainEqual({ from: "cli", to: "util" });
    expect(result).toContainEqual({ from: "repository", to: "util" });
  });
});
