import type { ImportEdge } from "../analysis/analyzeImportDependencies.js";

/**
 * Builds a Mermaid flowchart TB diagram showing leaf packages as subgraphs
 * and inter-package import dependencies as arrows.
 *
 * Each subgraph contains the type names exported by that package.
 * If a package has no types (e.g. all standalone functions, excluded by
 * design), a placeholder node is shown so the package remains visible
 * in the overview diagram.
 *
 * Packages and edges are rendered in lexicographic order for determinism.
 */
export function buildPackagesFlowchart(
  packages: string[],
  typesByPackage: Map<string, string[]>,
  edges: ImportEdge[]
): string {
  const sortedPackages = [...packages].sort((a, b) => a.localeCompare(b));
  const sortedEdges = [...edges].sort((a, b) =>
    a.from !== b.from ? a.from.localeCompare(b.from) : a.to.localeCompare(b.to)
  );

  const lines: string[] = [];
  lines.push("flowchart TB");

  for (const pkg of sortedPackages) {
    const types = typesByPackage.get(pkg) ?? [];
    const sortedTypes = [...types].sort((a, b) => a.localeCompare(b));

    lines.push(`  subgraph ${pkg}["${pkg}"]`);

    if (sortedTypes.length === 0) {
      lines.push(`    ${pkg}_no_types["(no types)"]`);
    } else {
      for (const typeName of sortedTypes) {
        lines.push(`    ${typeName}`);
      }
    }

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
