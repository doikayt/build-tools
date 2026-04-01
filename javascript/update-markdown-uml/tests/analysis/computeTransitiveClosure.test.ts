import { describe, test, expect } from "vitest";
import { computeTransitiveClosure } from "../../src/analysis/analyzeImportDependencies.js";
import type { ImportEdge } from "../../src/analysis/analyzeImportDependencies.js";

function edge(from: string, to: string): ImportEdge {
  return { from: from, to: to };
}

function sorted(edges: ImportEdge[]): ImportEdge[] {
  return [...edges].sort((a, b) =>
    a.from !== b.from ? a.from.localeCompare(b.from) : a.to.localeCompare(b.to)
  );
}

describe("computeTransitiveClosure()", () => {
  test("empty input returns empty", () => {
    expect(computeTransitiveClosure([])).toEqual([]);
  });

  test("single edge returned unchanged", () => {
    const result = computeTransitiveClosure([edge("a", "b")]);
    expect(sorted(result)).toEqual([edge("a", "b")]);
  });

  test("A→B, B→C adds A→C", () => {
    const result = computeTransitiveClosure([edge("a", "b"), edge("b", "c")]);
    expect(sorted(result)).toEqual([
      edge("a", "b"),
      edge("a", "c"),
      edge("b", "c"),
    ]);
  });

  test("A→B, B→C, C→D adds A→C, A→D, B→D", () => {
    const result = computeTransitiveClosure([
      edge("a", "b"),
      edge("b", "c"),
      edge("c", "d"),
    ]);
    expect(sorted(result)).toEqual([
      edge("a", "b"),
      edge("a", "c"),
      edge("a", "d"),
      edge("b", "c"),
      edge("b", "d"),
      edge("c", "d"),
    ]);
  });

  test("cycle A→B, B→A produces no self-edges and no infinite loop", () => {
    const result = computeTransitiveClosure([edge("a", "b"), edge("b", "a")]);
    const selfEdges = result.filter((e) => e.from === e.to);
    expect(selfEdges).toHaveLength(0);
    expect(sorted(result)).toEqual([edge("a", "b"), edge("b", "a")]);
  });

  test("duplicate direct edge produces one edge in output", () => {
    const result = computeTransitiveClosure([edge("a", "b"), edge("a", "b")]);
    expect(sorted(result)).toEqual([edge("a", "b")]);
  });
});
