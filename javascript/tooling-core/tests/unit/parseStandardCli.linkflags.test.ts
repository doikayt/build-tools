import { describe, test, expect } from "vitest";
import { parseStandardCli } from "../../src/cli/parseStandardCli.js";

describe("parseStandardCli — link flag central parsing", () => {
  test("validateExternalLinks defaults to true", () => {
    const result = parseStandardCli([]);
    expect(result.config.validateExternalLinks).toBe(true);
  });

  test("linkTimeoutMs defaults to 3000", () => {
    const result = parseStandardCli([]);
    expect(result.config.linkTimeoutMs).toBe(3000);
  });

  test("--no-external-link-check sets validateExternalLinks to false", () => {
    const result = parseStandardCli(["--no-external-link-check"]);
    expect(result.config.validateExternalLinks).toBe(false);
    expect(result.passthrough).toHaveLength(0);
  });

  test("-n sets validateExternalLinks to false", () => {
    const result = parseStandardCli(["-n"]);
    expect(result.config.validateExternalLinks).toBe(false);
    expect(result.passthrough).toHaveLength(0);
  });

  test("--link-timeout-ms sets linkTimeoutMs", () => {
    const result = parseStandardCli(["--link-timeout-ms", "5000"]);
    expect(result.config.linkTimeoutMs).toBe(5000);
    expect(result.passthrough).toHaveLength(0);
  });

  test("-l sets linkTimeoutMs", () => {
    const result = parseStandardCli(["-l", "1000"]);
    expect(result.config.linkTimeoutMs).toBe(1000);
    expect(result.passthrough).toHaveLength(0);
  });

  test("--no-external-link-check followed by file path — file goes to positionals", () => {
    const result = parseStandardCli([
      "--check",
      "--no-external-link-check",
      "README.md",
    ]);
    expect(result.config.validateExternalLinks).toBe(false);
    expect(result.positionals).toContain("README.md");
  });

  test("--link-timeout-ms consumes value; subsequent file path goes to positionals", () => {
    const result = parseStandardCli([
      "--check",
      "--link-timeout-ms",
      "5000",
      "README.md",
    ]);
    expect(result.config.linkTimeoutMs).toBe(5000);
    expect(result.positionals).toContain("README.md");
  });

  test("--link-timeout-ms without a value throws", () => {
    expect(() => parseStandardCli(["--link-timeout-ms"])).toThrow(
      "--link-timeout-ms requires a numeric value"
    );
  });

  test("--link-timeout-ms with a non-numeric value throws", () => {
    expect(() => parseStandardCli(["--link-timeout-ms", "fast"])).toThrow(
      "--link-timeout-ms requires a numeric value"
    );
  });
});
