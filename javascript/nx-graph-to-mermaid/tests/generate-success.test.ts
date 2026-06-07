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

  test("check mode requires generatedMermaidPath or markdownPath", () => {
    expect(() =>
      normalizeOptions({
        projectJsonPath: "project.json",
        mode: "check",
      })
    ).toThrow(
      "Either generatedMermaidPath or markdownPath is required in check mode"
    );
  });

  test("check mode rejects both generatedMermaidPath and markdownPath", () => {
    expect(() =>
      normalizeOptions({
        projectJsonPath: "project.json",
        mode: "check",
        generatedMermaidPath: "out.md",
        markdownPath: "README.md",
      })
    ).toThrow(
      "Specify only one of generatedMermaidPath or markdownPath in check mode"
    );
  });
});
