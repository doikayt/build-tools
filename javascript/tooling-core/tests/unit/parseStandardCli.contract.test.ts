import { parseStandardCli } from "../../src/cli/parseStandardCli";

describe("parseStandardCli — happy paths", () => {

  test("single file mode with positional argument", () => {
    const config = parseStandardCli(["README.md"]);

    expect(config).toEqual({
      help: false,
      checkMode: false,
      verbose: false,
      quiet: false,
      debug: false,
      mode: "single",
      targetPath: "README.md",
      excludeList: undefined
    });

    expect(Object.isFrozen(config)).toBe(true);
  });

  test("recursive mode", () => {
    const config = parseStandardCli([
      "--recursive",
      "docs"
    ]);

    expect(config).toEqual({
      help: false,
      checkMode: false,
      verbose: false,
      quiet: false,
      debug: false,
      mode: "recursive",
      targetPath: "docs",
      excludeList: undefined
    });
  });

  test("recursive + verbose + debug", () => {
    const config = parseStandardCli([
      "--recursive",
      "docs",
      "--verbose",
      "--debug"
    ]);

    expect(config.mode).toBe("recursive");
    expect(config.verbose).toBe(true);
    expect(config.debug).toBe(true);
  });

});

describe("parseStandardCli — exclude parsing", () => {

  test("custom exclude list", () => {
    const config = parseStandardCli([
      "--recursive",
      "docs",
      "--exclude",
      "node_modules,dist"
    ]);

    expect(config.excludeList).toEqual([
      "node_modules",
      "dist"
    ]);
  });

  test("empty exclude disables exclusions", () => {
    const config = parseStandardCli([
      "--recursive",
      "docs",
      "--exclude",
      ""
    ]);

    expect(config.excludeList).toEqual([]);
  });

  test("--exclude without argument throws", () => {
    expect(() =>
        parseStandardCli([
          "--recursive",
          "docs",
          "--exclude"
        ])
    ).toThrow();
  });

  test("--exclude followed by another flag throws", () => {
    expect(() =>
        parseStandardCli([
          "--recursive",
          "docs",
          "--exclude",
          "--verbose"
        ])
    ).toThrow();
  });

});

describe("parseStandardCli — help", () => {

  test("--help returns help=true", () => {
    const config = parseStandardCli(["--help"]);
    expect(config.help).toBe(true);
  });

});

describe("parseStandardCli — validation errors", () => {

  test("quiet and verbose together throws", () => {
    expect(() =>
      parseStandardCli([
        "--recursive",
        "docs",
        "--quiet",
        "--verbose"
      ])
    ).toThrow();
  });

  test("--recursive with positional file throws", () => {
    expect(() =>
      parseStandardCli([
        "--recursive",
        "docs",
        "README.md"
      ])
    ).toThrow();
  });

  test("--check without explicit target throws", () => {
    expect(() =>
      parseStandardCli(["--check"])
    ).toThrow();
  });

  test("--recursive without argument throws", () => {
    expect(() =>
      parseStandardCli(["--recursive"])
    ).toThrow();
  });

});

describe("parseStandardCli — check mode", () => {

  test("--check with single file", () => {
    const config = parseStandardCli([
      "--check",
      "README.md"
    ]);

    expect(config.checkMode).toBe(true);
    expect(config.mode).toBe("single");
    expect(config.targetPath).toBe("README.md");
  });

  test("--check with recursive", () => {
    const config = parseStandardCli([
      "--check",
      "--recursive",
      "docs"
    ]);

    expect(config.checkMode).toBe(true);
    expect(config.mode).toBe("recursive");
  });

});
