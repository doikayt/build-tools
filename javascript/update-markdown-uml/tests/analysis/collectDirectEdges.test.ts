import { describe, test, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { collectDirectEdges } from "../../src/analysis/analyzeImportDependencies.js";

let tmpDir: string;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "collect-edges-"));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

function write(relPath: string, content: string): string {
  const full = path.join(tmpDir, relPath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, "utf-8");
  return full;
}

function leafDir(name: string): string {
  return path.join(tmpDir, name);
}

describe("collectDirectEdges()", () => {
  test("no imports returns empty", () => {
    write("cli/index.ts", "export const x = 1;");
    const result = collectDirectEdges([leafDir("cli")], tmpDir);
    expect(result).toEqual([]);
  });

  test("import within same leaf dir is excluded", () => {
    write("cli/a.ts", 'import { b } from "./b.js";');
    write("cli/b.ts", "export const b = 1;");
    const result = collectDirectEdges([leafDir("cli")], tmpDir);
    expect(result).toEqual([]);
  });

  test("import from another leaf dir produces one edge", () => {
    write("cli/index.ts", 'import { x } from "../repository/types.js";');
    write("repository/types.ts", "export const x = 1;");
    const result = collectDirectEdges(
      [leafDir("cli"), leafDir("repository")],
      tmpDir
    );
    expect(result).toEqual([{ from: "cli", to: "repository" }]);
  });

  test("import from outside sourceRoot is excluded", () => {
    write("cli/index.ts", 'import { x } from "some-external-package";');
    const result = collectDirectEdges([leafDir("cli")], tmpDir);
    expect(result).toEqual([]);
  });

  test("two files in same leaf both importing same target produces one edge", () => {
    write("cli/a.ts", 'import { x } from "../repository/types.js";');
    write("cli/b.ts", 'import { x } from "../repository/types.js";');
    write("repository/types.ts", "export const x = 1;");
    const result = collectDirectEdges(
      [leafDir("cli"), leafDir("repository")],
      tmpDir
    );
    expect(result).toEqual([{ from: "cli", to: "repository" }]);
  });

  test("multiple distinct cross-leaf imports produce multiple edges", () => {
    write(
      "cli/index.ts",
      [
        'import { x } from "../repository/types.js";',
        'import { y } from "../util/helpers.js";',
      ].join("\n")
    );
    write("repository/types.ts", "export const x = 1;");
    write("util/helpers.ts", "export const y = 2;");
    const result = collectDirectEdges(
      [leafDir("cli"), leafDir("repository"), leafDir("util")],
      tmpDir
    );
    expect(result).toEqual([
      { from: "cli", to: "repository" },
      { from: "cli", to: "util" },
    ]);
  });
});
