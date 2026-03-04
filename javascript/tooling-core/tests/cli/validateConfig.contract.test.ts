import { validateConfig } from "../../src/cli/validateConfig";
import type { StandardCliConfig } from "../../src/cli/parseStandardCli";

function base(): StandardCliConfig {
  return {
    help: false,
    checkMode: false,
    verbose: false,
    quiet: false,
    debug: false,
    mode: "single",
    targetPath: null,
    excludeList: undefined
  };
}

describe("validateConfig — CLI invariants", () => {

  test("quiet + verbose conflict", () => {
    const config: StandardCliConfig = {
      ...base(),
      quiet: true,
      verbose: true
    };

    expect(() => validateConfig(config)).toThrow(
        "--quiet and --verbose cannot be used together."
    );
  });

  test("--check requires explicit target", () => {
    const config: StandardCliConfig = {
      ...base(),
      checkMode: true
    };

    expect(() => validateConfig(config)).toThrow(
        "--check requires a file argument or --recursive."
    );
  });

  test("--check with single file allowed", () => {
    const config: StandardCliConfig = {
      ...base(),
      checkMode: true,
      targetPath: "README.md"
    };

    expect(() => validateConfig(config)).not.toThrow();
  });

  test("--check with recursive allowed", () => {
    const config: StandardCliConfig = {
      ...base(),
      checkMode: true,
      mode: "recursive",
      targetPath: "docs"
    };

    expect(() => validateConfig(config)).not.toThrow();
  });

  test("recursive requires path", () => {
    const config: StandardCliConfig = {
      ...base(),
      mode: "recursive",
      targetPath: null
    };

    expect(() => validateConfig(config)).toThrow(
        "--recursive requires a directory argument."
    );
  });

  test("implicit single mode allowed", () => {
    expect(() => validateConfig(base())).not.toThrow();
  });

  test("help short-circuits validation", () => {
    const config: StandardCliConfig = {
      ...base(),
      help: true,
      quiet: true,
      verbose: true
    };

    expect(() => validateConfig(config)).not.toThrow();
  });

});