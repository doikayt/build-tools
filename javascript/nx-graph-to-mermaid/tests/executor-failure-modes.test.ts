import { vi, describe, test, expect, afterEach } from "vitest";
import runExecutor from "../src/executors/generate/executor.js";

// ---------------------------------------------------------------------------
// Unsupported mode — public API path
//
// Passing an unrecognised mode string causes normalizeOptions() to throw inside
// resolveExecutionContext(), which catches the error, logs it, and returns
// { success: false }.  The executor returns that failure before the mode-dispatch
// switch is ever reached.
// ---------------------------------------------------------------------------

afterEach(() => {
  vi.restoreAllMocks();
});

function captureStderr(): string[] {
  const writes: string[] = [];
  vi.spyOn(process.stderr, "write").mockImplementation((chunk) => {
    writes.push(String(chunk));
    return true;
  });
  return writes;
}

describe("unsupported mode — public API path", () => {
  test("returns { success: false }", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});

    const result = runExecutor({
      projectJsonPath: "irrelevant.json",
      mode: "bogus" as any,
    });

    expect(result.success).toBe(false);
  });

  test("reports the unrecognised mode via console.error", () => {
    const errors: string[] = [];
    vi.spyOn(console, "error").mockImplementation((...args) => {
      errors.push(args.map(String).join(" "));
    });

    runExecutor({
      projectJsonPath: "irrelevant.json",
      mode: "bogus" as any,
    });

    expect(errors.some((m) => m.includes("bogus"))).toBe(true);
  });

  test("emits a [debug] line to stderr before failing when debug=true", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const writes = captureStderr();

    runExecutor({
      projectJsonPath: "irrelevant.json",
      mode: "bogus" as any,
      debug: true,
    });

    expect(writes.some((line) => line.startsWith("[debug]"))).toBe(true);
  });

  test("emits no [debug] lines when debug=false", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const writes = captureStderr();

    runExecutor({
      projectJsonPath: "irrelevant.json",
      mode: "bogus" as any,
      debug: false,
    });

    expect(writes.filter((line) => line.startsWith("[debug]"))).toHaveLength(0);
  });
});
