import { validateConfig } from "../../src/cli/parseStandardCli.js";
import type { RunConfig } from "../../src/repository/types.js";

function base(): RunConfig {
    return {
        runMode: "update",
        verbose: false,
        quiet: false,
        debug: false,
        mode: "single",
        recursivePath: undefined,
        exclude: [],
    };
}

describe("validateConfig — CLI invariants", () => {
    test("quiet + verbose conflict", () => {
        const config: RunConfig = {
            ...base(),
            quiet: true,
            verbose: true,
        };

        expect(() => validateConfig(config, [])).toThrow();
    });

    test("normal config passes", () => {
        expect(() => validateConfig(base(), [])).not.toThrow();
    });
});
