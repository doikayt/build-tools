import { describe, test, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { extractTypeNames } from "../../src/analysis/extractTypeNames.js";

let tmpDir: string;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "extract-types-"));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

function write(name: string, content: string): void {
  fs.writeFileSync(path.join(tmpDir, name), content, "utf-8");
}

describe("extractTypeNames()", () => {
  test("empty directory returns empty array", () => {
    const result = extractTypeNames(tmpDir);
    expect(result).toEqual([]);
  });

  test("exported class is included", () => {
    write("runner.ts", "export class Runner {}");
    const result = extractTypeNames(tmpDir);
    expect(result).toContain("Runner");
  });

  test("exported interface is included", () => {
    write("types.ts", "export interface Config { verbose: boolean; }");
    const result = extractTypeNames(tmpDir);
    expect(result).toContain("Config");
  });

  test("exported type alias is included", () => {
    write("types.ts", 'export type Status = "updated" | "unchanged";');
    const result = extractTypeNames(tmpDir);
    expect(result).toContain("Status");
  });

  test("non-exported interface is included", () => {
    write("types.ts", [
      "interface Base { file: string; }",
      "export interface Derived extends Base { link: string; }",
    ].join("\n"));
    const result = extractTypeNames(tmpDir);
    expect(result).toContain("Base");
    expect(result).toContain("Derived");
  });

  test("standalone functions are excluded", () => {
    write("utils.ts", [
      "export function walkFiles(dir: string): string[] { return []; }",
      "export function debugLog(msg: string): void {}",
    ].join("\n"));
    const result = extractTypeNames(tmpDir);
    expect(result).not.toContain("walkFiles");
    expect(result).not.toContain("debugLog");
  });

  test("result is sorted lexicographically", () => {
    write("types.ts", [
      "export class Zebra {}",
      "export interface Alpha {}",
      "export type Mango = string;",
    ].join("\n"));
    const result = extractTypeNames(tmpDir);
    expect(result).toEqual(["Alpha", "Mango", "Zebra"]);
  });

  test("duplicate names across files deduplicated", () => {
    write("a.ts", "export interface Config {}");
    write("b.ts", "export interface Config {}");
    const result = extractTypeNames(tmpDir);
    expect(result.filter((n) => n === "Config")).toHaveLength(1);
  });
});
