/**
 * Builds a Markdown table listing leaf components and their descriptions.
 * Component names are clickable links to their corresponding component details
 * section anchors (e.g. [cli](#cli)).
 * If a description is absent or undefined, the cell renders as "TBD" —
 * a visible signal that the component description is missing.
 * Components are rendered in lexicographic order for determinism.
 */
export function buildComponentsTable(
  components: string[],
  descriptions: Map<string, string | undefined>
): string {
  const sortedComponents = [...components].sort((a, b) => a.localeCompare(b));

  const lines: string[] = [];
  lines.push("| Component | Description |");
  lines.push("|-----------|-------------|");

  for (const component of sortedComponents) {
    const description = descriptions.get(component) ?? "TBD";
    lines.push(`| [${component}](#${component}) | ${description} |`);
  }

  return lines.join("\n");
}
