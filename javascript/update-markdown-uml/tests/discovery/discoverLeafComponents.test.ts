import { describe, test, expect, beforeEach, afterEach, vi } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { discoverLeafComponents } from "../../src/discovery/discoverLeafComponents.js";

let tmpDir: string;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "discover-leaf-"));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

function write(relPath: string): void {
  const full = path.join(tmpDir, relPath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, "// stub", "utf-8");
}

describe("discoverLeafComponents()", () => {
  test("empty source root returns empty array", () => {
    const result = discoverLeafComponents(tmpDir, []);
    expect(result).toEqual([]);
  });

  test("ts files only at root level (no subdirs) returns empty array", () => {
    write("index.ts");
    write("util.ts");
    const result = discoverLeafComponents(tmpDir, []);
    expect(result).toEqual([]);
  });

  test("subdir with ts files is included", () => {
    write("cli/parseArgs.ts");
    const result = discoverLeafComponents(tmpDir, []);
    expect(result).toEqual([path.join(tmpDir, "cli")]);
  });

  test("subdir with only test files is excluded after pattern filter", () => {
    write("cli/parseArgs.test.ts");
    const result = discoverLeafComponents(tmpDir, ["*.test.ts"]);
    expect(result).toEqual([]);
  });

  test("subdir with mix of test and non-test files is included", () => {
    write("cli/parseArgs.ts");
    write("cli/parseArgs.test.ts");
    const result = discoverLeafComponents(tmpDir, ["*.test.ts"]);
    expect(result).toEqual([path.join(tmpDir, "cli")]);
  });

  test("subdir with no ts files at all is excluded", () => {
    write("cli/README.md");
    write("cli/schema.json");
    const result = discoverLeafComponents(tmpDir, []);
    expect(result).toEqual([]);
  });

  test("result is sorted lexicographically", () => {
    write("zzz/a.ts");
    write("aaa/b.ts");
    write("mmm/c.ts");
    const result = discoverLeafComponents(tmpDir, []);
    expect(result).toEqual([
      path.join(tmpDir, "aaa"),
      path.join(tmpDir, "mmm"),
      path.join(tmpDir, "zzz"),
    ]);
  });

  test("empty skipTestPatterns includes all subdirs with any ts files", () => {
    write("cli/parseArgs.test.ts");
    write("util/walk.spec.ts");
    const result = discoverLeafComponents(tmpDir, []);
    expect(result).toEqual([
      path.join(tmpDir, "cli"),
      path.join(tmpDir, "util"),
    ]);
  });

  test("multiple patterns all applied", () => {
    write("cli/parseArgs.test.ts");
    write("cli/parseArgs.spec.ts");
    const result = discoverLeafComponents(tmpDir, ["*.test.ts", "*.spec.ts"]);
    expect(result).toEqual([]);
  });

  test("multiple subdirs, some excluded by pattern", () => {
    write("cli/parseArgs.ts");
    write("util/walk.test.ts");
    const result = discoverLeafComponents(tmpDir, ["*.test.ts"]);
    expect(result).toEqual([path.join(tmpDir, "cli")]);
  });
});

test("grandchild dirs with ts files are included", () => {
  write("internal/parsing/parser.ts");
  write("internal/formatting/formatter.ts");
  const result = discoverLeafComponents(tmpDir, []);
  expect(result).toEqual(
    [
      path.join(tmpDir, "internal", "parsing"),
      path.join(tmpDir, "internal", "formatting"),
    ].sort((a, b) => a.localeCompare(b))
  );
});

test("intermediate dir with no ts files of its own is not a leaf", () => {
  write("internal/parsing/parser.ts");
  const result = discoverLeafComponents(tmpDir, []);
  expect(result).toEqual([path.join(tmpDir, "internal", "parsing")]);
});

test("pattern filter applies at all depths", () => {
  write("internal/parsing/parser.test.ts");
  write("internal/formatting/formatter.ts");
  const result = discoverLeafComponents(tmpDir, ["*.test.ts"]);
  expect(result).toEqual([path.join(tmpDir, "internal", "formatting")]);
});

test("dir with both ts files and qualifying children warns and includes both as leaves", () => {
  write("internal/index.ts");
  write("internal/parsing/parser.ts");
  const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
  const result = discoverLeafComponents(tmpDir, []);
  expect(result).toEqual([
    path.join(tmpDir, "internal"),
    path.join(tmpDir, "internal", "parsing"),
  ]);
  expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("internal"));
  warnSpy.mockRestore();
});
