import { describe, test, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { resolveSourceRoot } from "../../src/processor/resolveSourceRoot.js";

const MD_NAME = "README.md";
let tmpDir: string;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "resolve-root-"));
  fs.writeFileSync(path.join(tmpDir, MD_NAME), "# doc", "utf-8");
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

function mdFile(): string {
  return path.join(tmpDir, MD_NAME);
}

describe("resolveSourceRoot()", () => {
  test("explicit sourceRoot is resolved and returned", () => {
    const explicit = path.join(tmpDir, "custom");
    fs.mkdirSync(explicit);
    const result = resolveSourceRoot(mdFile(), explicit);
    expect(result).toBe(path.resolve(explicit));
  });

  test("returns src/ when it exists next to markdown file", () => {
    const srcDir = path.join(tmpDir, "src");
    fs.mkdirSync(srcDir);
    const result = resolveSourceRoot(mdFile(), undefined);
    expect(result).toBe(srcDir);
  });

  test("returns markdown dir when src/ does not exist", () => {
    const result = resolveSourceRoot(mdFile(), undefined);
    expect(result).toBe(tmpDir);
  });

  test("returns markdown dir when src/ exists but is a file not a directory", () => {
    fs.writeFileSync(path.join(tmpDir, "src"), "not a dir", "utf-8");
    const result = resolveSourceRoot(mdFile(), undefined);
    expect(result).toBe(tmpDir);
  });
});
