import { validateConfig } from "../../src/cli/validateConfig";
import type { StandardCliConfig } from "../../src/cli/types";

function base(): StandardCliConfig {
  return {
    help: false,
    version: false,
    checkMode: false,
    verbose: false,
    quiet: false,
    debug: false,
    mode: "single",
    recursivePath: undefined,
    exclude: []
  };
}

describe("validateConfig — CLI invariants", () => {

  test("quiet + verbose conflict", () => {
    const config: StandardCliConfig = {
      ...base(),
      quiet: true,
      verbose: true
    };

    expect(() => validateConfig(config, [])).toThrow();
  });

  test("normal config passes", () => {
    expect(() => validateConfig(base(), [])).not.toThrow();
  });

});