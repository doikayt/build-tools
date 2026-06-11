import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { UmlFileProcessor } from "../../src/processor/UmlFileProcessor.js";
import type { UmlRunConfig } from "../../src/cli/UmlRunConfig.js";

const UML_MARKERS = [
  "<!-- UML:components:START -->",
  "<!-- UML:components:END -->",
  "",
  "<!-- UML:components-table:START -->",
  "<!-- UML:components-table:END -->",
  "",
  "<!-- UML:component-details:START -->",
  "<!-- UML:component-details:END -->",
].join("\n");

function makeConfig(overrides: Partial<UmlRunConfig> = {}): UmlRunConfig {
  return {
    runMode: "update",
    mode: "single",
    verbose: false,
    quiet: false,
    debug: false,
    exclude: [],
    validateExternalLinks: false,
    linkTimeoutMs: 3000,
    excludePackages: [],
    sourceRoot: undefined,
    skipTestPatterns: [],
    ...overrides,
  };
}

let tmpDir: string;
let mdPath: string;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "uml-debug-"));
  mdPath = path.join(tmpDir, "README.md");
  fs.writeFileSync(mdPath, `# Test\n\n${UML_MARKERS}\n`, "utf-8");

  const componentDir = path.join(tmpDir, "src", "widget");
  fs.mkdirSync(componentDir, { recursive: true });
  fs.writeFileSync(
    path.join(componentDir, "Widget.ts"),
    "export class Widget {}\n",
    "utf-8"
  );
});

afterEach(() => {
  vi.restoreAllMocks();
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe("UmlFileProcessor debug output", () => {
  test("writes [debug]-prefixed lines to stderr when debug=true", () => {
    const writes: string[] = [];
    vi.spyOn(process.stderr, "write").mockImplementation((chunk) => {
      writes.push(String(chunk));
      return true;
    });

    new UmlFileProcessor().process(mdPath, makeConfig({ debug: true }));

    expect(writes.length).toBeGreaterThan(0);
    expect(writes.every((line) => line.startsWith("[debug]"))).toBe(true);
  });

  test("does not write [debug] lines to stderr when debug=false", () => {
    const writes: string[] = [];
    vi.spyOn(process.stderr, "write").mockImplementation((chunk) => {
      writes.push(String(chunk));
      return true;
    });

    new UmlFileProcessor().process(mdPath, makeConfig({ debug: false }));

    expect(writes.filter((line) => line.startsWith("[debug]"))).toHaveLength(0);
  });

  test("debug output includes the file path being processed", () => {
    const writes: string[] = [];
    vi.spyOn(process.stderr, "write").mockImplementation((chunk) => {
      writes.push(String(chunk));
      return true;
    });

    new UmlFileProcessor().process(mdPath, makeConfig({ debug: true }));

    expect(writes.some((line) => line.includes(mdPath))).toBe(true);
  });
});
