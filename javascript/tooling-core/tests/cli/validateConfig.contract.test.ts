import { validateConfig } from "../../src/cli/validateConfig";
import type { CoreConfig } from "../../src/repository/types";

function base(): CoreConfig {
  return {
    runMode: "update",
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
    const config: CoreConfig = {
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