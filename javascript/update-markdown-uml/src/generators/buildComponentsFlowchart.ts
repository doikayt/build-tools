import type { ImportEdge } from "../analysis/analyzeImportDependencies.js";

/**
 * Builds a Mermaid flowchart TB diagram showing leaf components as compact
 * subgraphs with inter-component import dependency arrows.
 *
 * Each subgraph shows only the component name — type details are available
 * in the per-component classDiagram sections below. This keeps the overview
 * diagram readable regardless of how many types each component contains.
 *
 * Components and edges are rendered in lexicographic order for determinism.
 */
export function buildComponentsFlowchart(
  components: string[],
  edges: ImportEdge[]
): string {
  const sortedComponents = [...components].sort((a, b) => a.localeCompare(b));
  const sortedEdges = [...edges].sort((a, b) =>
    a.from !== b.from ? a.from.localeCompare(b.from) : a.to.localeCompare(b.to)
  );

  const lines: string[] = [];
  lines.push("flowchart TB");

  for (const component of sortedComponents) {
    lines.push(`  subgraph ${component}["${component}"]`);
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
