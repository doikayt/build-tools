import fs from "node:fs";
import path from "node:path";
import os from "node:os";

import { walkFiles, DEFAULT_EXCLUDE_DIRS } from "../src/util/walkFiles.js";

function makeTmpDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "walk-contract-"));
}

function write(filePath: string): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, "x", "utf8");
}

function cleanup(dir: string): void {
  fs.rmSync(dir, { recursive: true, force: true });
}

describe("walkFiles() contract", () => {
  test("throws if rootDir does not exist", () => {
    const missing = path.join(os.tmpdir(), "definitely-not-there");

    expect(() => walkFiles({ rootDir: missing })).toThrow();
  });

  test("returns absolute paths relative to rootDir input", () => {
    const dir = makeTmpDir();

    write(path.join(dir, "a.txt"));

    const result = walkFiles({ rootDir: dir });

    expect(result[0]).toBe(path.join(dir, "a.txt"));

    cleanup(dir);
  });

  test("empty extensions array behaves like no filter", () => {
    const dir = makeTmpDir();

    write(path.join(dir, "a.txt"));
    write(path.join(dir, "b.md"));

    const result = walkFiles({
      rootDir: dir,
      extensions: [],
    });

    const basenames = result.map((p) => path.basename(p));
    expect(basenames).toEqual(["a.txt", "b.md"]);

    cleanup(dir);
  });

  test("multiple extension filter works", () => {
    const dir = makeTmpDir();

    write(path.join(dir, "a.txt"));
    write(path.join(dir, "b.md"));
    write(path.join(dir, "c.json"));

    const result = walkFiles({
      rootDir: dir,
      extensions: [".md", ".json"],
    });

    const basenames = result.map((p) => path.basename(p));
    expect(basenames).toEqual(["b.md", "c.json"]);

    cleanup(dir);
  });

  test("extension matching is suffix-based (not substring)", () => {
    const dir = makeTmpDir();

    write(path.join(dir, "file.md"));
    write(path.join(dir, "file.md.backup"));

    const result = walkFiles({
      rootDir: dir,
      extensions: [".md"],
    });

    const basenames = result.map((p) => path.basename(p));
    expect(basenames).toEqual(["file.md"]);

    cleanup(dir);
  });

  test("nested directories are sorted lexicographically", () => {
    const dir = makeTmpDir();

    write(path.join(dir, "b", "z.txt"));
    write(path.join(dir, "a", "y.txt"));
    write(path.join(dir, "a", "x.txt"));

    const result = walkFiles({ rootDir: dir });
    const relative = result.map((p) => path.relative(dir, p));

    expect(relative).toEqual([
      path.join("a", "x.txt"),
      path.join("a", "y.txt"),
      path.join("b", "z.txt"),
    ]);

    cleanup(dir);
  });

  test("custom excludeDirs completely overrides default", () => {
    const dir = makeTmpDir();

    write(path.join(dir, "node_modules", "hidden.txt"));
    write(path.join(dir, "visible.txt"));

    const result = walkFiles({
      rootDir: dir,
      excludeDirs: [], // disable exclusions
    });

    const basenames = result.map((p) => path.basename(p));

    expect(basenames).toEqual(["hidden.txt", "visible.txt"].sort());

    cleanup(dir);
  });

  test("DEFAULT_EXCLUDE_DIRS contains node_modules", () => {
    expect(DEFAULT_EXCLUDE_DIRS).toContain("node_modules");
  });

  test("deterministic across many runs", () => {
    const dir = makeTmpDir();

    for (let i = 0; i < 20; i++) {
      write(path.join(dir, `file-${i}.txt`));
    }

    const first = walkFiles({ rootDir: dir });

    for (let i = 0; i < 10; i++) {
      const again = walkFiles({ rootDir: dir });
      expect(again).toEqual(first);
    }

    cleanup(dir);
  });
});
