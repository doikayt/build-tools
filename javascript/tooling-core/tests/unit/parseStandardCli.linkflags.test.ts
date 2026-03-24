import { describe, test, expect } from "vitest";
import { parseStandardCli } from "../../src/cli/parseStandardCli.js";
import type { PluginOption } from "../../src/cli/types.js";

// Simulate the options declared by update-markdown-toc's descriptor
const linkPluginOptions: PluginOption[] = [
  {
    flag: "--no-external-link-check",
    description: "Skip external link validation",
  },
  { flag: "-n", description: "Skip external link validation (short)" },
  {
    flag: "--link-timeout-ms",
    description: "Timeout for external link requests",
    requiresValue: true,
    valueName: "ms",
  },
  {
    flag: "-l",
    description: "Timeout for external link requests (short)",
    requiresValue: true,
    valueName: "ms",
  },
];

describe("parseStandardCli — link flag passthrough (Option B)", () => {
  test("--no-external-link-check passes through", () => {
    const result = parseStandardCli(
      ["--no-external-link-check"],
      linkPluginOptions
    );
    expect(result.passthrough).toContain("--no-external-link-check");
  });

  test("-n passes through", () => {
    const result = parseStandardCli(["-n"], linkPluginOptions);
    expect(result.passthrough).toContain("-n");
  });

  test("--link-timeout-ms passes through with value", () => {
    const result = parseStandardCli(
      ["--link-timeout-ms", "5000"],
      linkPluginOptions
    );
    expect(result.passthrough).toContain("--link-timeout-ms");
    expect(result.passthrough).toContain("5000");
  });

  test("-l passes through with value", () => {
    const result = parseStandardCli(["-l", "1000"], linkPluginOptions);
    expect(result.passthrough).toContain("-l");
    expect(result.passthrough).toContain("1000");
  });

  test("--no-external-link-check followed by file path — file path goes to positionals", () => {
    const result = parseStandardCli(
      ["--check", "--no-external-link-check", "README.md"],
      linkPluginOptions
    );
    expect(result.passthrough).toContain("--no-external-link-check");
    expect(result.positionals).toContain("README.md");
  });

  test("--link-timeout-ms followed by file path — value consumed, file path goes to positionals", () => {
    const result = parseStandardCli(
      ["--check", "--link-timeout-ms", "5000", "README.md"],
      linkPluginOptions
    );
    expect(result.passthrough).toContain("--link-timeout-ms");
    expect(result.passthrough).toContain("5000");
    expect(result.positionals).toContain("README.md");
  });

  test("validateExternalLinks defaults to true in standard config", () => {
    const result = parseStandardCli([]);
    expect(result.config.validateExternalLinks).toBe(true);
  });

  test("linkTimeoutMs defaults to 3000 in standard config", () => {
    const result = parseStandardCli([]);
    expect(result.config.linkTimeoutMs).toBe(3000);
  });
});
