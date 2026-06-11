import { describe, test, expect } from "vitest";
import { parseStandardCli, generateHelp } from "@datalackey/tooling-core";
import { descriptor } from "../../src/cli/descriptor.js";

describe("--help flag", () => {
  test("--help sets result.help=true", () => {
    const result = parseStandardCli(["--help"]);
    expect(result.help).toBe(true);
  });

  test("-h sets result.help=true", () => {
    const result = parseStandardCli(["-h"]);
    expect(result.help).toBe(true);
  });

  test("generateHelp includes the plugin name", () => {
    expect(generateHelp(descriptor)).toContain("update-markdown-uml");
  });

  test("generateHelp lists --debug", () => {
    expect(generateHelp(descriptor)).toContain("--debug");
  });

  test("generateHelp lists --quiet", () => {
    expect(generateHelp(descriptor)).toContain("--quiet");
  });

  test("generateHelp lists --check", () => {
    expect(generateHelp(descriptor)).toContain("--check");
  });
});

describe("--debug flag", () => {
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
