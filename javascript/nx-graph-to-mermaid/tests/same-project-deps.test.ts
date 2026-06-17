import path from "path";
import {
  vi,
  describe,
  test,
  expect,
  beforeEach,
  afterEach,
  type MockInstance,
} from "vitest";
import runExecutor from "../src/executors/generate/executor.js";

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const fixturesDir = path.resolve(__dirname, "fixtures/same-project-deps");

describe("same-project qualified dep refs", () => {
  let consoleSpy: MockInstance;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  test("projectName:targetName refs render as edges; cross-project and ^ refs are skipped", async () => {
    const result = await runExecutor({
      projectJsonPath: path.join(fixturesDir, "project.json"),
      mode: "check",
      markdownPath: path.join(fixturesDir, "expected-readme.md"),
    });

    expect(consoleSpy).not.toHaveBeenCalled();
    expect(result.success).toBe(true);
  });
});
