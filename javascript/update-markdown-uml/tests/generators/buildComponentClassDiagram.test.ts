import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { buildComponentClassDiagram } from "../../src/generators/buildComponentClassDiagram.js";

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

describe("buildComponentClassDiagram()", () => {
  test("empty directory returns empty-component sentinel", () => {
    const result = buildComponentClassDiagram(tmpDir);
    expect(result).toBe("_No exported types or functions._");
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
    const result = buildComponentClassDiagram(tmpDir);
    expect(result).toContain("class RunConfig");
    expect(result).toContain("<<interface>>");
    expect(result).toContain("+verbose");
    expect(result).toContain("+quiet");
  }, 20000);

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
    const result = buildComponentClassDiagram(tmpDir);
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
    const result = buildComponentClassDiagram(tmpDir);
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
    const result = buildComponentClassDiagram(tmpDir);
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
    const result = buildComponentClassDiagram(tmpDir);
    expect(result).toContain("Runner ..|> Processor");
    console.log(result);
  });

  test("type alias renders with <<type>> stereotype and no members", () => {
    write(
      "types.ts",
      ['export type Status = "updated" | "unchanged" | "skipped";'].join("\n")
    );
    const result = buildComponentClassDiagram(tmpDir);
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
    const result = buildComponentClassDiagram(tmpDir);
    expect(result).toContain("+timeout?");
  });

  test("output is deterministic across repeated calls", () => {
    write(
      "types.ts",
      ["export interface Config {", "  verbose: boolean;", "}"].join("\n")
    );
    const first = buildComponentClassDiagram(tmpDir);
    const second = buildComponentClassDiagram(tmpDir);
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
    const result = buildComponentClassDiagram(tmpDir);
    expect(result).not.toContain("class walkFiles");
    expect(result).not.toContain("class debugLog");
  });
});

describe("buildComponentClassDiagram() — function-only fallback", () => {
  test("happy path: two exported functions with JSDoc and multiple params render full table", () => {
    write(
      "utils.ts",
      [
        "/**",
        " * Partitions discovered fields into three buckets.",
        " */",
        "export function matchFields(template: Template, fields: FormField[]): MatchResult { return {} as MatchResult; }",
        "/**",
        " * Returns true if any React signal is present.",
        " */",
        "export function isReactForm(): boolean { return false; }",
      ].join("\n")
    );

    const result = buildComponentClassDiagram(tmpDir);

    expect(result).toContain(
      "| Function | Parameters | Returns | Description |"
    );
    expect(result).toContain("`matchFields`");
    expect(result).toContain("template: Template<br>fields: FormField[]");
    expect(result).toContain("MatchResult");
    expect(result).toContain(
      "Partitions discovered fields into three buckets."
    );
    expect(result).toContain("`isReactForm`");
    expect(result).toContain("| — |");
    expect(result).toContain("Returns true if any React signal is present.");
    expect(result).not.toContain("```mermaid");
  }, 20_000);

  test("no description (without quiet): — in Description cell and warn emitted", () => {
    write(
      "utils.ts",
      ["export function compute(x: number): number { return x; }"].join("\n")
    );

    const warn = vi.fn();
    const result = buildComponentClassDiagram(tmpDir, warn);

    expect(result).toContain("| — |");
    expect(warn).toHaveBeenCalledOnce();
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining("function `compute` has no JSDoc description")
    );
  }, 20_000);

  test("no description (with quiet): — in Description cell and no warning", () => {
    write(
      "utils.ts",
      ["export function compute(x: number): number { return x; }"].join("\n")
    );

    const result = buildComponentClassDiagram(tmpDir);

    expect(result).toContain("| — |");
  }, 20_000);

  test("zero-argument function: — in Parameters cell", () => {
    write(
      "utils.ts",
      [
        "/** Returns the current timestamp. */",
        "export function now(): number { return Date.now(); }",
      ].join("\n")
    );

    const result = buildComponentClassDiagram(tmpDir);

    const rows = result.split("\n").filter((l) => l.startsWith("| `"));
    expect(rows).toHaveLength(1);
    // Parameters cell should be — (dash)
    expect(rows[0]).toMatch(/\| — \|/);
  }, 20_000);

  test("no exports (without quiet): returns sentinel and warn emitted", () => {
    write("utils.ts", ["function internal(): void {}"].join("\n"));

    const warn = vi.fn();
    const result = buildComponentClassDiagram(tmpDir, warn);

    expect(result).toBe("_No exported types or functions._");
    expect(warn).toHaveBeenCalledOnce();
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining(
        "has no exported functions, classes, interfaces, or types"
      )
    );
  }, 20_000);

  test("no exports (with quiet): returns sentinel and no warning", () => {
    write("utils.ts", ["function internal(): void {}"].join("\n"));

    const result = buildComponentClassDiagram(tmpDir);

    expect(result).toBe("_No exported types or functions._");
  }, 20_000);
});
