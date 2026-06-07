import { normalizeOptions } from "../src/executors/generate/normalizeOptions.js";

describe("normalizeOptions()", () => {
  test("defaults to generate mode", () => {
    const result = normalizeOptions({
      projectJsonPath: "project.json",
      generatedMermaidPath: "out.md",
    });

    expect(result.mode).toBe("generate");
  });

  test("throws if projectJsonPath missing", () => {
    expect(() => normalizeOptions({} as any)).toThrow(
      "projectJsonPath is required"
    );
  });

  // ---------------------------
  // GENERATE MODE
  // ---------------------------

  test("generate mode requires generatedMermaidPath", () => {
    expect(() =>
      normalizeOptions({
        projectJsonPath: "project.json",
        mode: "generate",
      })
    ).toThrow("generatedMermaidPath is required in generate mode");
  });

  test("generate mode rejects markdownPath", () => {
    expect(() =>
      normalizeOptions({
        projectJsonPath: "project.json",
        mode: "generate",
        generatedMermaidPath: "out.md",
        markdownPath: "README.md",
      })
    ).toThrow("markdownPath is invalid in generate mode");
  });

  // ---------------------------
  // CHECK MODE
  // ---------------------------

  test("check mode requires markdownPath", () => {
    expect(() =>
      normalizeOptions({
        projectJsonPath: "project.json",
        mode: "check",
      })
    ).toThrow("markdownPath is required in check mode");
  });

  test("check mode rejects generatedMermaidPath", () => {
    expect(() =>
      normalizeOptions({
        projectJsonPath: "project.json",
        mode: "check",
        generatedMermaidPath: "out.md",
        markdownPath: "README.md",
      })
    ).toThrow("generatedMermaidPath is invalid in check mode");
  });

  test("check mode accepts markdownPath", () => {
    const result = normalizeOptions({
      projectJsonPath: "project.json",
      mode: "check",
      markdownPath: "README.md",
    });
    expect(result.mode).toBe("check");
    expect(result.markdownPath).toBe("README.md");
    expect(result.generatedMermaidPath).toBeUndefined();
  });
});
