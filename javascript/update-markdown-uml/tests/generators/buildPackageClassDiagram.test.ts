import { describe, test, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { buildPackageClassDiagram } from "../../src/generators/buildPackageClassDiagram.js";

let tmpDir: string;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "class-diagram-"));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

function write(name: string, content: string): void {
  fs.writeFileSync(path.join(tmpDir, name), content, "utf-8");
}

describe("buildPackageClassDiagram()", () => {
  test("empty directory produces minimal diagram", () => {
    const result = buildPackageClassDiagram(tmpDir);
    expect(result).toContain("```mermaid");
    expect(result).toContain("classDiagram");
    expect(result).toContain("```");
  });

  test("exported interface renders with <<interface>> stereotype", () => {
    write(
      "types.ts",
      [
        "export interface RunConfig {",
        "  verbose: boolean;",
        "  quiet: boolean;",
        "}",
      ].join("\n")
    );
    const result = buildPackageClassDiagram(tmpDir);
    expect(result).toContain("class RunConfig");
    expect(result).toContain("<<interface>>");
    expect(result).toContain("+verbose");
    expect(result).toContain("+quiet");
  }, 10000);

  test("non-exported interface is included", () => {
    write(
      "types.ts",
      [
        "interface Internal {",
        "  file: string;",
        "}",
        "export interface Public extends Internal {",
        "  link: string;",
        "}",
      ].join("\n")
    );
    const result = buildPackageClassDiagram(tmpDir);
    expect(result).toContain("class Internal");
    expect(result).toContain("class Public");
  }, 10000);

  test("interface extends relationship renders ..|> arrow", () => {
    write(
      "types.ts",
      [
        "interface Base {",
        "  file: string;",
        "}",
        "export interface Derived extends Base {",
        "  link: string;",
        "}",
      ].join("\n")
    );
    const result = buildPackageClassDiagram(tmpDir);
    expect(result).toContain("Derived ..|> Base");
  });

  test("class with properties and methods renders correctly", () => {
    write(
      "runner.ts",
      [
        "export class Runner {",
        "  private name: string;",
        "  public run(file: string): void {}",
        "}",
      ].join("\n")
    );
    const result = buildPackageClassDiagram(tmpDir);
    expect(result).toContain("class Runner");
    expect(result).toContain("-name");
    expect(result).toContain("+run");
  });

  test("class implements interface renders ..|> arrow", () => {
    write(
      "runner.ts",
      [
        "export interface Processor {",
        "  process(file: string): string;",
        "}",
        "export class Runner implements Processor {",
        "  process(file: string): string { return file; }",
        "}",
      ].join("\n")
    );
    const result = buildPackageClassDiagram(tmpDir);
    expect(result).toContain("Runner ..|> Processor");
    console.log(result);
  });

  test("type alias renders with <<type>> stereotype and no members", () => {
    write(
      "types.ts",
      ['export type Status = "updated" | "unchanged" | "skipped";'].join("\n")
    );
    const result = buildPackageClassDiagram(tmpDir);
    expect(result).toContain("class Status");
    expect(result).toContain("<<type>>");
    expect(result).not.toContain("updated");
    expect(result).not.toContain("unchanged");
  });

  test("optional interface property renders with ?", () => {
    write(
      "types.ts",
      ["export interface Options {", "  timeout?: number;", "}"].join("\n")
    );
    const result = buildPackageClassDiagram(tmpDir);
    expect(result).toContain("+timeout?");
  });

  test("output is deterministic across repeated calls", () => {
    write(
      "types.ts",
      ["export interface Config {", "  verbose: boolean;", "}"].join("\n")
    );
    const first = buildPackageClassDiagram(tmpDir);
    const second = buildPackageClassDiagram(tmpDir);
    expect(first).toBe(second);
  });

  test("standalone functions produce no class nodes", () => {
    write(
      "utils.ts",
      [
        "export function walkFiles(dir: string): string[] { return []; }",
        "export function debugLog(msg: string): void {}",
      ].join("\n")
    );
    const result = buildPackageClassDiagram(tmpDir);
    expect(result).not.toContain("class walkFiles");
    expect(result).not.toContain("class debugLog");
  });
});
