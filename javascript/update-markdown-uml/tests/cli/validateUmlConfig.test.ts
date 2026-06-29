import { describe, test, expect } from "vitest";
import { validateUmlConfig } from "../../src/cli/validateUmlConfig.js";
import type { UmlRunConfig } from "../../src/cli/UmlRunConfig.js";

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

describe("validateUmlConfig()", () => {
  test("throws when --recursive mode is passed", () => {
    expect(() =>
      validateUmlConfig(makeConfig({ mode: "recursive" }))
    ).toThrow("--recursive is not supported");
  });

  test("does not throw for valid single-mode config", () => {
    expect(() => validateUmlConfig(makeConfig())).not.toThrow();
  });
});
