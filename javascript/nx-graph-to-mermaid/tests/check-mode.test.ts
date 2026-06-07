import * as fs from "fs";
import * as path from "path";
import runExecutor from "../src/executors/generate/executor.js";
import { safeUnlink } from "./utils/fs.js";
import {
  vi,
  describe,
  test,
  expect,
  beforeEach,
  afterEach,
  type MockInstance,
} from "vitest";

const __dirname = path.dirname(new URL(import.meta.url).pathname);

describe("check mode behavior", () => {
  const tmpDir = path.resolve(__dirname);
  const projectPath = path.resolve(tmpDir, "tmp-project.json");
  const generatedPath = path.resolve(tmpDir, "tmp-generated.md");
  const markdownPath = path.resolve(tmpDir, "tmp-readme.md");

  let consoleSpy: MockInstance;

  beforeEach(() => {
    safeUnlink(generatedPath);
    fs.writeFileSync(
      projectPath,
      JSON.stringify({
        targets: {
          build: {
            description: "Compile source",
          },
        },
      }),
      "utf-8"
    );

    consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    safeUnlink(projectPath);
    safeUnlink(generatedPath);
    safeUnlink(markdownPath);
    consoleSpy.mockRestore();
  });

  test("fails if generated file missing in check mode", async () => {
    const result = await runExecutor({
      projectJsonPath: projectPath,
      mode: "check",
      generatedMermaidPath: generatedPath,
    });

    expect(result.success).toBe(false);
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("Generated file not found at:")
    );
  });

  test("fails if drift detected", async () => {
    fs.writeFileSync(generatedPath, "WRONG CONTENT", "utf-8");

    const result = await runExecutor({
      projectJsonPath: projectPath,
      mode: "check",
      generatedMermaidPath: generatedPath,
    });

    expect(result.success).toBe(false);
    expect(consoleSpy).toHaveBeenCalledWith("Mermaid output drift detected.");
  });

  test("succeeds if no drift", async () => {
    await runExecutor({
      projectJsonPath: projectPath,
      mode: "generate",
      generatedMermaidPath: generatedPath,
    });

    const result = await runExecutor({
      projectJsonPath: projectPath,
      mode: "check",
      generatedMermaidPath: generatedPath,
    });

    expect(result.success).toBe(true);
    expect(consoleSpy).not.toHaveBeenCalled();
  });

  // ---- markdownPath workflow ----

  test("fails if markdown file missing in check mode", async () => {
    const result = await runExecutor({
      projectJsonPath: projectPath,
      mode: "check",
      markdownPath: path.resolve(tmpDir, "nonexistent-readme.md"),
    });

    expect(result.success).toBe(false);
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("Markdown file not found at:")
    );
  });

  test("fails if drift detected in markdown check mode", async () => {
    const NX_GRAPH_START = "<!-- NX_GRAPH:START -->";
    const NX_GRAPH_END = "<!-- NX_GRAPH:END -->";
    fs.writeFileSync(
      markdownPath,
      `# Title\n${NX_GRAPH_START}\nWRONG CONTENT\n${NX_GRAPH_END}\n`,
      "utf-8"
    );

    const result = await runExecutor({
      projectJsonPath: projectPath,
      mode: "check",
      markdownPath,
    });

    expect(result.success).toBe(false);
    expect(consoleSpy).toHaveBeenCalledWith("Mermaid output drift detected.");
  });

  test("succeeds if no drift in markdown check mode", async () => {
    const NX_GRAPH_START = "<!-- NX_GRAPH:START -->";
    const NX_GRAPH_END = "<!-- NX_GRAPH:END -->";
    fs.writeFileSync(
      markdownPath,
      `# Title\n${NX_GRAPH_START}\n${NX_GRAPH_END}\n`,
      "utf-8"
    );

    await runExecutor({
      projectJsonPath: projectPath,
      mode: "update",
      markdownPath,
    });

    const result = await runExecutor({
      projectJsonPath: projectPath,
      mode: "check",
      markdownPath,
    });

    expect(result.success).toBe(true);
    expect(consoleSpy).not.toHaveBeenCalled();
  });
});
