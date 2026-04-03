import type { ImportEdge } from "../analysis/analyzeImportDependencies.js";

/**
 * Builds a Mermaid flowchart TB diagram showing leaf packages as compact
 * subgraphs with inter-package import dependency arrows.
 *
 * Each subgraph shows only the package name — type details are available
 * in the per-package classDiagram sections below. This keeps the overview
 * diagram readable regardless of how many types each package contains.
 *
 * Packages and edges are rendered in lexicographic order for determinism.
 */
export function buildPackagesFlowchart(
  packages: string[],
  edges: ImportEdge[]
): string {
  const sortedPackages = [...packages].sort((a, b) => a.localeCompare(b));
  const sortedEdges = [...edges].sort((a, b) =>
    a.from !== b.from ? a.from.localeCompare(b.from) : a.to.localeCompare(b.to)
  );

  const lines: string[] = [];
  lines.push("flowchart TB");

  for (const pkg of sortedPackages) {
    lines.push(`  subgraph ${pkg}["${pkg}"]`);
    lines.push(`  end`);
  }

  if (sortedEdges.length > 0) {
    lines.push("");
    for (const edge of sortedEdges) {
      lines.push(`  ${edge.from} --> ${edge.to}`);
    }
  }

  return "```mermaid\n" + lines.join("\n") + "\n```";
}
