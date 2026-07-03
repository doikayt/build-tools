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
    excludeComponents: [],
    sourceRoot: undefined,
    skipTestPatterns: [],
    ...overrides,
  };
}

let tmpDir: string;
let mdPath: string;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "uml-exclude-warn-"));
  mdPath = path.join(tmpDir, "README.md");
  fs.writeFileSync(mdPath, `# Test\n\n${UML_MARKERS}\n`, "utf-8");

  for (const name of ["cli", "math-engine"]) {
    const dir = path.join(tmpDir, "src", name);
    fs.mkdirSync(dir, { recursive: true });
    // Use an exported type so buildComponentClassDiagram emits a mermaid block
    // rather than the function-table fallback (which would emit extra warnings).
    fs.writeFileSync(
      path.join(dir, "index.ts"),
      'export type Placeholder = "placeholder";\n',
      "utf-8"
    );
  }
});

afterEach(() => {
  vi.restoreAllMocks();
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe("UmlFileProcessor exclusion warnings", () => {
  test("warns when an excluded component is not among discovered leaf dirs", () => {
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {});

    new UmlFileProcessor().process(
      mdPath,
      makeConfig({
        sourceRoot: path.join(tmpDir, "src"),
        excludeComponents: ["nonexistent"],
      })
    );

    expect(spy).toHaveBeenCalledOnce();
    expect(spy).toHaveBeenCalledWith(expect.stringContaining("nonexistent"));
  }, 10_000);

  test("warns once per missing excluded component", () => {
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {});

    new UmlFileProcessor().process(
      mdPath,
      makeConfig({
        sourceRoot: path.join(tmpDir, "src"),
        excludeComponents: ["missing-a", "missing-b"],
      })
    );

    expect(spy).toHaveBeenCalledTimes(2);
  }, 10_000);

  test("does not warn when excluded component exists as a leaf dir", () => {
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {});

    new UmlFileProcessor().process(
      mdPath,
      makeConfig({
        sourceRoot: path.join(tmpDir, "src"),
        excludeComponents: ["cli"],
      })
    );

    expect(spy).not.toHaveBeenCalledWith(expect.stringContaining("cli"));
  }, 10_000);

  test("suppresses exclusion warning when quiet=true", () => {
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {});

    new UmlFileProcessor().process(
      mdPath,
      makeConfig({
        sourceRoot: path.join(tmpDir, "src"),
        excludeComponents: ["nonexistent"],
        quiet: true,
      })
    );

    expect(spy).not.toHaveBeenCalled();
  }, 10_000);

  test("suppresses mixed-concern discovery warning when quiet=true", () => {
    const mixedDir = fs.mkdtempSync(path.join(os.tmpdir(), "uml-mixed-warn-"));
    try {
      const mixedMd = path.join(mixedDir, "README.md");
      fs.writeFileSync(mixedMd, `# Test\n\n${UML_MARKERS}\n`, "utf-8");
      // internal/ has its own .ts file AND a qualifying child — triggers mixed-concern warn
      const internal = path.join(mixedDir, "src", "internal");
      fs.mkdirSync(path.join(internal, "parsing"), { recursive: true });
      fs.writeFileSync(
        path.join(internal, "index.ts"),
        "export {};\n",
        "utf-8"
      );
      fs.writeFileSync(
        path.join(internal, "parsing", "parser.ts"),
        "export {};\n",
        "utf-8"
      );

      const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
      new UmlFileProcessor().process(
        mixedMd,
        makeConfig({ sourceRoot: path.join(mixedDir, "src"), quiet: true })
      );
      expect(spy).not.toHaveBeenCalled();
    } finally {
      fs.rmSync(mixedDir, { recursive: true, force: true });
    }
  }, 10_000);
});
