import { describe, test, expect } from "vitest";
import { buildPackagesTable } from "../../src/generators/buildPackagesTable.js";

const CLI = "cli";
const REPOSITORY = "repository";
const UTIL = "util";

describe("buildPackagesTable()", () => {
  test("empty packages produces header only", () => {
    const result = buildPackagesTable([], new Map());
    expect(result).toBe("| Package | Description |\n|---------|-------------|");
  });

  test("single package with description renders row", () => {
    const result = buildPackagesTable(
      [CLI],
      new Map([[CLI, "CLI parsing and option wiring"]])
    );
    expect(result).toContain(`| [${CLI}](#${CLI}) |`);
    expect(result).toContain("CLI parsing and option wiring");
  });

  test("missing description renders TBD", () => {
    const result = buildPackagesTable([CLI], new Map([[CLI, undefined]]));
    expect(result).toContain("TBD");
  });

  test("package absent from descriptions map renders TBD", () => {
    const result = buildPackagesTable([CLI], new Map());
    expect(result).toContain("TBD");
  });

  test("package name is a clickable link", () => {
    const result = buildPackagesTable([CLI], new Map([[CLI, "desc"]]));
    expect(result).toContain(`[${CLI}](#${CLI})`);
  });

  test("packages rendered in lexicographic order", () => {
    const result = buildPackagesTable(
      [UTIL, CLI, REPOSITORY],
      new Map([
        [CLI, "cli desc"],
        [REPOSITORY, "repo desc"],
        [UTIL, "util desc"],
      ])
    );
    const cliPos = result.indexOf(`[${CLI}]`);
    const repoPos = result.indexOf(`[${REPOSITORY}]`);
    const utilPos = result.indexOf(`[${UTIL}]`);
    expect(cliPos).toBeLessThan(repoPos);
    expect(repoPos).toBeLessThan(utilPos);
    console.log(result);
  });

  test("multiple packages all appear in output", () => {
    const result = buildPackagesTable(
      [CLI, REPOSITORY, UTIL],
      new Map([
        [CLI, "cli desc"],
        [REPOSITORY, "repo desc"],
        [UTIL, "util desc"],
      ])
    );
    expect(result).toContain(`[${CLI}]`);
    expect(result).toContain(`[${REPOSITORY}]`);
    expect(result).toContain(`[${UTIL}]`);
  });

  test("output is deterministic across repeated calls", () => {
    const descriptions = new Map([
      [CLI, "cli desc"],
      [UTIL, "util desc"],
    ]);
    const first = buildPackagesTable([CLI, UTIL], descriptions);
    const second = buildPackagesTable([CLI, UTIL], descriptions);
    expect(first).toBe(second);
  });
});
