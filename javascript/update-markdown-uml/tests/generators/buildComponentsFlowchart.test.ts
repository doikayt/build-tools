import { describe, test, expect } from "vitest";
import { buildComponentsFlowchart } from "../../src/generators/buildComponentsFlowchart.js";
import type { ImportEdge } from "../../src/analysis/analyzeImportDependencies.js";

const CLI = "cli";
const REPOSITORY = "repository";
const UTIL = "util";

function edge(from: string, to: string): ImportEdge {
  return { from: from, to: to };
}

describe("buildComponentsFlowchart()", () => {
  test("empty components produces minimal header", () => {
    const result = buildComponentsFlowchart([], []);
    expect(result).toBe("```mermaid\nflowchart TB\n```");
  });

  test("single component renders subgraph", () => {
    const result = buildComponentsFlowchart([CLI], []);
    expect(result).toContain(`subgraph ${CLI}["${CLI}"]`);
    expect(result).toContain("end");
  });

  test("multiple components rendered in lexicographic order", () => {
    const result = buildComponentsFlowchart([UTIL, CLI], []);
    const cliPos = result.indexOf(`subgraph ${CLI}`);
    const utilPos = result.indexOf(`subgraph ${UTIL}`);
    expect(cliPos).toBeLessThan(utilPos);
  });

  test("edge produces arrow between components", () => {
    const result = buildComponentsFlowchart(
      [CLI, REPOSITORY],
      [edge(CLI, REPOSITORY)]
    );
    expect(result).toContain(`${CLI} --> ${REPOSITORY}`);
  });

  test("no edges produces no arrow lines", () => {
    const result = buildComponentsFlowchart([CLI], []);
    expect(result).not.toContain("-->");
  });

  test("multiple edges rendered in lexicographic order", () => {
    const result = buildComponentsFlowchart(
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
    const first = buildComponentsFlowchart([CLI, UTIL], edgeList);
    const second = buildComponentsFlowchart([CLI, UTIL], edgeList);
    expect(first).toBe(second);
  });

  test("output is wrapped in mermaid fences", () => {
    const result = buildComponentsFlowchart([CLI], []);
    expect(result).toContain("```mermaid");
    expect(result).toContain("```");
  });
});
