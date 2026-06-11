import { vi, describe, test, expect, afterEach } from "vitest";

// ---------------------------------------------------------------------------
// Unsupported mode — switch default branch
//
// The switch default in runExecutor() is TypeScript's exhaustiveness guard and
// is unreachable through the normal API (normalizeOptions rejects unknown modes
// before the switch).  We reach it by mocking resolveExecutionContext to return
// a context whose mode is not in the known union, bypassing normalizeOptions.
// ---------------------------------------------------------------------------

vi.mock("../src/executors/generate/normalizeOptions.js", async (importOriginal) => {
  const actual = await importOriginal<
    typeof import("../src/executors/generate/normalizeOptions.js")
  >();
  return { ...actual, resolveExecutionContext: vi.fn() };
});

import runExecutor from "../src/executors/generate/executor.js";
import { resolveExecutionContext } from "../src/executors/generate/normalizeOptions.js";

afterEach(() => {
  vi.restoreAllMocks();
  vi.mocked(resolveExecutionContext).mockReset();
});

function captureStderr(): string[] {
  const writes: string[] = [];
  vi.spyOn(process.stderr, "write").mockImplementation((chunk) => {
    writes.push(String(chunk));
    return true;
  });
  return writes;
}

describe("unsupported mode — switch default branch", () => {
  test("returns { success: false } when the switch default fires", () => {
    vi.mocked(resolveExecutionContext).mockReturnValue({
      success: true,
      options: { projectJsonPath: "x.json", mode: "never-land" as any, debug: false },
      project: { targets: {} },
    });

    const result = runExecutor({ projectJsonPath: "x.json", mode: "never-land" as any });

    expect(result.success).toBe(false);
  });

  test("emits a [debug] result line when debug=true and the switch default fires", () => {
    const writes = captureStderr();

    vi.mocked(resolveExecutionContext).mockReturnValue({
      success: true,
      options: { projectJsonPath: "x.json", mode: "never-land" as any, debug: true },
      project: { targets: {} },
    });

    runExecutor({ projectJsonPath: "x.json", mode: "never-land" as any, debug: true });

    // dispatching + result lines should both appear
    const debugLines = writes.filter((line) => line.startsWith("[debug]"));
    expect(debugLines.length).toBeGreaterThanOrEqual(2);
    expect(debugLines.some((line) => line.includes("result"))).toBe(true);
  });

  test("emits no [debug] lines when debug=false and the switch default fires", () => {
    const writes = captureStderr();

    vi.mocked(resolveExecutionContext).mockReturnValue({
      success: true,
      options: { projectJsonPath: "x.json", mode: "never-land" as any, debug: false },
      project: { targets: {} },
    });

    runExecutor({ projectJsonPath: "x.json", mode: "never-land" as any });

    expect(writes.filter((line) => line.startsWith("[debug]"))).toHaveLength(0);
  });
});
