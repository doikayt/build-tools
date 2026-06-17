import { describe, test, expect } from "vitest";
import { buildComponentsTable } from "../../src/generators/buildComponentsTable.js";

const CLI = "cli";
const REPOSITORY = "repository";
const UTIL = "util";

describe("buildComponentsTable()", () => {
  test("empty components produces header only", () => {
    const result = buildComponentsTable([], new Map());
    expect(result).toBe(
      "| Component | Description |\n|-----------|-------------|"
    );
  });

  test("single component with description renders row", () => {
    const result = buildComponentsTable(
      [CLI],
      new Map([[CLI, "CLI parsing and option wiring"]])
    );
    expect(result).toContain(`| [${CLI}](#${CLI}) |`);
    expect(result).toContain("CLI parsing and option wiring");
  });

  test("missing description renders TBD", () => {
    const result = buildComponentsTable([CLI], new Map([[CLI, undefined]]));
    expect(result).toContain("TBD");
  });

  test("component absent from descriptions map renders TBD", () => {
    const result = buildComponentsTable([CLI], new Map());
    expect(result).toContain("TBD");
  });

  test("component name is a clickable link", () => {
    const result = buildComponentsTable([CLI], new Map([[CLI, "desc"]]));
    expect(result).toContain(`[${CLI}](#${CLI})`);
  });

  test("components rendered in lexicographic order", () => {
    const result = buildComponentsTable(
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

  test("multiple components all appear in output", () => {
    const result = buildComponentsTable(
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
    const first = buildComponentsTable([CLI, UTIL], descriptions);
    const second = buildComponentsTable([CLI, UTIL], descriptions);
    expect(first).toBe(second);
  });
});
