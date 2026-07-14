import { describe, test, expect, vi, afterEach } from "vitest";
import { parseStandardCli, debugLog } from "@doikayt/tooling-core";
import type { RunConfig } from "@doikayt/tooling-core";

function makeConfig(overrides: Partial<RunConfig> = {}): RunConfig {
  return {
    runMode: "update",
    mode: "single",
    verbose: false,
    quiet: false,
    debug: false,
    exclude: [],
    validateExternalLinks: false,
    linkTimeoutMs: 3000,
    ...overrides,
  };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("--debug flag parsing", () => {
  test("--debug sets config.debug=true", () => {
    const result = parseStandardCli(["--debug", "README.md"]);
    expect(result.config.debug).toBe(true);
  });

  test("-d sets config.debug=true", () => {
    const result = parseStandardCli(["-d", "README.md"]);
    expect(result.config.debug).toBe(true);
  });

  test("debug defaults to false when flag is absent", () => {
    const result = parseStandardCli(["README.md"]);
    expect(result.config.debug).toBe(false);
  });
});

describe("debugLog behavior", () => {
  test("writes [debug]-prefixed message to stderr when debug=true", () => {
    const writes: string[] = [];
    vi.spyOn(process.stderr, "write").mockImplementation((chunk) => {
      writes.push(String(chunk));
      return true;
    });

    debugLog(makeConfig({ debug: true }), "test message");

    expect(writes).toHaveLength(1);
    expect(writes[0]).toBe("[debug] test message\n");
  });

  test("writes nothing to stderr when debug=false", () => {
    const writes: string[] = [];
    vi.spyOn(process.stderr, "write").mockImplementation((chunk) => {
      writes.push(String(chunk));
      return true;
    });

    debugLog(makeConfig({ debug: false }), "test message");

    expect(writes).toHaveLength(0);
  });

  test("[debug] prefix is present on every message", () => {
    const writes: string[] = [];
    vi.spyOn(process.stderr, "write").mockImplementation((chunk) => {
      writes.push(String(chunk));
      return true;
    });

    debugLog(makeConfig({ debug: true }), "first");
    debugLog(makeConfig({ debug: true }), "second");

    expect(writes).toHaveLength(2);
    expect(writes[0]).toBe("[debug] first\n");
    expect(writes[1]).toBe("[debug] second\n");
  });
});
