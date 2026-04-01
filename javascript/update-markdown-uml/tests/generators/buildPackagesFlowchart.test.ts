import { describe, test, expect } from "vitest";
import { buildPackagesFlowchart } from "../../src/generators/buildPackagesFlowchart.js";
import type { ImportEdge } from "../../src/analysis/analyzeImportDependencies.js";

const CLI = "cli";
const REPOSITORY = "repository";
const UTIL = "util";

function edge(from: string, to: string): ImportEdge {
  return { from: from, to: to };
}

describe("buildPackagesFlowchart()", () => {
  test("empty packages produces minimal header", () => {
    const result = buildPackagesFlowchart([], new Map(), []);
    expect(result).toBe("flowchart TB");
  });

  test("single package with types renders subgraph", () => {
    const types = new Map([[CLI, ["RunConfig", "ParsedCliResult"]]]);
    const result = buildPackagesFlowchart([CLI], types, []);
    expect(result).toContain(`subgraph ${CLI}["${CLI}"]`);
    expect(result).toContain("RunConfig");
    expect(result).toContain("ParsedCliResult");
    expect(result).toContain("end");
  });

  test("package with no types renders placeholder node", () => {
    const types = new Map([[UTIL, []]]);
    const result = buildPackagesFlowchart([UTIL], types, []);
    expect(result).toContain(`${UTIL}_no_types["(no types)"]`);
  });

  test("package absent from typesByPackage renders placeholder node", () => {
    const result = buildPackagesFlowchart([UTIL], new Map(), []);
    expect(result).toContain(`${UTIL}_no_types["(no types)"]`);
  });

  test("multiple packages rendered in lexicographic order", () => {
    const types = new Map([
      [UTIL, ["walkFiles"]],
      [CLI, ["RunConfig"]],
    ]);
    const result = buildPackagesFlowchart([UTIL, CLI], types, []);
    const cliPos = result.indexOf(`subgraph ${CLI}`);
    const utilPos = result.indexOf(`subgraph ${UTIL}`);
    expect(cliPos).toBeLessThan(utilPos);
  });

  test("types within a subgraph rendered in lexicographic order", () => {
    const types = new Map([[CLI, ["ZType", "AType", "MType"]]]);
    const result = buildPackagesFlowchart([CLI], types, []);
    const aPos = result.indexOf("AType");
    const mPos = result.indexOf("MType");
    const zPos = result.indexOf("ZType");
    expect(aPos).toBeLessThan(mPos);
    expect(mPos).toBeLessThan(zPos);
  });

  test("edge produces arrow between packages", () => {
    const types = new Map([
      [CLI, ["RunConfig"]],
      [REPOSITORY, ["RepositoryRunner"]],
    ]);
    const result = buildPackagesFlowchart([CLI, REPOSITORY], types, [
      edge(CLI, REPOSITORY),
    ]);
    expect(result).toContain(`${CLI} --> ${REPOSITORY}`);
  });

  test("no edges produces no arrow lines", () => {
    const types = new Map([[CLI, ["RunConfig"]]]);
    const result = buildPackagesFlowchart([CLI], types, []);
    expect(result).not.toContain("-->");
  });

  test("multiple edges rendered in lexicographic order", () => {
    const types = new Map([
      [CLI, ["RunConfig"]],
      [REPOSITORY, ["RepositoryRunner"]],
      [UTIL, ["walkFiles"]],
    ]);
    const result = buildPackagesFlowchart([CLI, REPOSITORY, UTIL], types, [
      edge(REPOSITORY, UTIL),
      edge(CLI, REPOSITORY),
      edge(CLI, UTIL),
    ]);
    const cliRepoPos = result.indexOf(`${CLI} --> ${REPOSITORY}`);
    const cliUtilPos = result.indexOf(`${CLI} --> ${UTIL}`);
    const repoUtilPos = result.indexOf(`${REPOSITORY} --> ${UTIL}`);
    expect(cliRepoPos).toBeLessThan(cliUtilPos);
    expect(cliUtilPos).toBeLessThan(repoUtilPos);

    console.log(result);
  });

  test("output is deterministic across repeated calls", () => {
    const types = new Map([
      [CLI, ["RunConfig", "ParsedCliResult"]],
      [UTIL, ["walkFiles"]],
    ]);
    const edgeList = [edge(CLI, UTIL)];
    const first = buildPackagesFlowchart([CLI, UTIL], types, edgeList);
    const second = buildPackagesFlowchart([CLI, UTIL], types, edgeList);
    expect(first).toBe(second);
  });
});
