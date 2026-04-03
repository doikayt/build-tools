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
    const result = buildPackagesFlowchart([], []);
    expect(result).toBe("```mermaid\nflowchart TB\n```");
  });

  test("single package renders subgraph", () => {
    const result = buildPackagesFlowchart([CLI], []);
    expect(result).toContain(`subgraph ${CLI}["${CLI}"]`);
    expect(result).toContain("end");
  });

  test("multiple packages rendered in lexicographic order", () => {
    const result = buildPackagesFlowchart([UTIL, CLI], []);
    const cliPos = result.indexOf(`subgraph ${CLI}`);
    const utilPos = result.indexOf(`subgraph ${UTIL}`);
    expect(cliPos).toBeLessThan(utilPos);
  });

  test("edge produces arrow between packages", () => {
    const result = buildPackagesFlowchart(
      [CLI, REPOSITORY],
      [edge(CLI, REPOSITORY)]
    );
    expect(result).toContain(`${CLI} --> ${REPOSITORY}`);
  });

  test("no edges produces no arrow lines", () => {
    const result = buildPackagesFlowchart([CLI], []);
    expect(result).not.toContain("-->");
  });

  test("multiple edges rendered in lexicographic order", () => {
    const result = buildPackagesFlowchart(
      [CLI, REPOSITORY, UTIL],
      [edge(REPOSITORY, UTIL), edge(CLI, REPOSITORY), edge(CLI, UTIL)]
    );
    const cliRepoPos = result.indexOf(`${CLI} --> ${REPOSITORY}`);
    const cliUtilPos = result.indexOf(`${CLI} --> ${UTIL}`);
    const repoUtilPos = result.indexOf(`${REPOSITORY} --> ${UTIL}`);
    expect(cliRepoPos).toBeLessThan(cliUtilPos);
    expect(cliUtilPos).toBeLessThan(repoUtilPos);
  });

  test("output is deterministic across repeated calls", () => {
    const edgeList = [edge(CLI, UTIL)];
    const first = buildPackagesFlowchart([CLI, UTIL], edgeList);
    const second = buildPackagesFlowchart([CLI, UTIL], edgeList);
    expect(first).toBe(second);
  });

  test("output is wrapped in mermaid fences", () => {
    const result = buildPackagesFlowchart([CLI], []);
    expect(result).toContain("```mermaid");
    expect(result).toContain("```");
  });
});
