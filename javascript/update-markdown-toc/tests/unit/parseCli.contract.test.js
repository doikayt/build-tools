import { parseCli } from "../../src/cli/parseCli.js";

describe("parseCli explicit contract", () => {

  test("recursive verbose", () => {
    const config = parseCli([
      "--recursive",
      "docs",
      "--verbose"
    ]);

    expect(config).toEqual({
      checkMode: false,
      verbose: true,
      quiet: false,
      debug: false,
      isRecursive: true,
      recursivePath: "docs",
      targetFile: null,
      excludeList: null
    });

    expect(Object.isFrozen(config)).toBe(true);
  });

  test("recursive with custom exclude", () => {
    const config = parseCli([
      "--recursive",
      "docs",
      "--exclude",
      "node_modules,dist"
    ]);

    expect(config).toEqual({
      checkMode: false,
      verbose: false,
      quiet: false,
      debug: false,
      isRecursive: true,
      recursivePath: "docs",
      targetFile: null,
      excludeList: ["node_modules", "dist"]
    });
  });

  test("recursive with empty exclude disables exclusions", () => {
    const config = parseCli([
      "--recursive",
      "docs",
      "--exclude",
      ""
    ]);

    expect(config).toEqual({
      checkMode: false,
      verbose: false,
      quiet: false,
      debug: false,
      isRecursive: true,
      recursivePath: "docs",
      targetFile: null,
      excludeList: []
    });
  });

  test("quiet and verbose together throws", () => {
    expect(() =>
      parseCli([
        "--recursive",
        "docs",
        "--quiet",
        "--verbose"
      ])
    ).toThrow();
  });

  test("--check without file or recursive throws", () => {
    expect(() =>
      parseCli(["--check"])
    ).toThrow();
  });

});
