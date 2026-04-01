import { describe, test, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { collectDirectEdges } from "../../src/analysis/analyzeImportDependencies.js";

const CLI = "cli";
const REPOSITORY = "repository";
const UTIL = "util";

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
    write(`${CLI}/index.ts`, "export const x = 1;");
    const result = collectDirectEdges([leafDir(CLI)], tmpDir);
    expect(result).toEqual([]);
  });

  test("import within same leaf dir is excluded", () => {
    write(`${CLI}/a.ts`, 'import { b } from "./b.js";');
    write(`${CLI}/b.ts`, "export const b = 1;");
    const result = collectDirectEdges([leafDir(CLI)], tmpDir);
    expect(result).toEqual([]);
  }, 10000);

  test("import from another leaf dir produces one edge", () => {
    write(`${CLI}/index.ts`, `import { x } from "../${REPOSITORY}/types.js";`);
    write(`${REPOSITORY}/types.ts`, "export const x = 1;");
    const result = collectDirectEdges(
      [leafDir(CLI), leafDir(REPOSITORY)],
      tmpDir
    );
    expect(result).toEqual([{ from: CLI, to: REPOSITORY }]);
  });

  test("import from outside sourceRoot is excluded", () => {
    write(`${CLI}/index.ts`, 'import { x } from "some-external-package";');
    const result = collectDirectEdges([leafDir(CLI)], tmpDir);
    expect(result).toEqual([]);
  });

  test("two files in same leaf both importing same target produces one edge", () => {
    write(`${CLI}/a.ts`, `import { x } from "../${REPOSITORY}/types.js";`);
    write(`${CLI}/b.ts`, `import { x } from "../${REPOSITORY}/types.js";`);
    write(`${REPOSITORY}/types.ts`, "export const x = 1;");
    const result = collectDirectEdges(
      [leafDir(CLI), leafDir(REPOSITORY)],
      tmpDir
    );
    expect(result).toEqual([{ from: CLI, to: REPOSITORY }]);
  });

  test("multiple distinct cross-leaf imports produce multiple edges", () => {
    write(
      `${CLI}/index.ts`,
      [
        `import { x } from "../${REPOSITORY}/types.js";`,
        `import { y } from "../${UTIL}/helpers.js";`,
      ].join("\n")
    );
    write(`${REPOSITORY}/types.ts`, "export const x = 1;");
    write(`${UTIL}/helpers.ts`, "export const y = 2;");
    const result = collectDirectEdges(
      [leafDir(CLI), leafDir(REPOSITORY), leafDir(UTIL)],
      tmpDir
    );
    expect(result).toEqual([
      { from: CLI, to: REPOSITORY },
      { from: CLI, to: UTIL },
    ]);
  });
});
