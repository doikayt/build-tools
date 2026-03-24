import runExecutor from "../src/executors/generate/executor.js";

describe("generate executor - missing project.json", () => {
  it("fails when project.json does not exist", async () => {
    const result = await runExecutor({
      projectJsonPath: "non-existent-project.json",
      generatedMermaidPath: "out.md",
      mode: "generate",
    });

    expect(result.success).toBe(false);
  });
});
