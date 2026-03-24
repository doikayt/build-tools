import { parseStandardCli } from "../../src/index.js";

describe("parseStandardCli — happy paths", () => {
  test("single file mode with positional argument", () => {
    const result = parseStandardCli(["README.md"]);

    expect(result.config.mode).toBe("single");
    expect(result.positionals).toEqual(["README.md"]);
  });

  test("recursive mode", () => {
    const result = parseStandardCli(["--recursive", "docs"]);

    expect(result.config.mode).toBe("recursive");
    expect(result.config.recursivePath).toBe("docs");
  });

  test("recursive + verbose + debug", () => {
    const result = parseStandardCli([
      "--recursive",
      "docs",
      "--verbose",
      "--debug",
    ]);

    expect(result.config.mode).toBe("recursive");
    expect(result.config.verbose).toBe(true);
    expect(result.config.debug).toBe(true);
  });
});

describe("parseStandardCli — exclude parsing", () => {
  test("custom exclude list", () => {
    const result = parseStandardCli([
      "--recursive",
      "docs",
      "--exclude",
      "node_modules,dist",
    ]);

    expect(result.config.exclude).toEqual(["node_modules", "dist"]);
  });

  test("empty exclude disables exclusions", () => {
    const result = parseStandardCli(["--recursive", "docs", "--exclude", ""]);

    expect(result.config.exclude).toEqual([]);
  });

  test("--exclude without argument throws", () => {
    expect(() =>
      parseStandardCli(["--recursive", "docs", "--exclude"])
    ).toThrow();
  });
});

describe("parseStandardCli — help", () => {
  test("--help returns help=true", () => {
    const result = parseStandardCli(["--help"]);
    expect(result.help).toBe(true);
  });
});

describe("parseStandardCli — validation errors", () => {
  test("quiet and verbose together throws", () => {
    expect(() =>
      parseStandardCli(["--recursive", "docs", "--quiet", "--verbose"])
    ).toThrow();
  });

  test("--recursive without argument throws", () => {
    expect(() => parseStandardCli(["--recursive"])).toThrow();
  });
});

describe("parseStandardCli — check mode", () => {
  test("--check with single file", () => {
    const result = parseStandardCli(["--check", "README.md"]);

    expect(result.config.runMode).toBe("check");
    expect(result.config.mode).toBe("single");
    expect(result.positionals).toEqual(["README.md"]);
  });

  test("--check with recursive", () => {
    const result = parseStandardCli(["--check", "--recursive", "docs"]);

    expect(result.config.runMode).toBe("check");
    expect(result.config.mode).toBe("recursive");
  });
});
