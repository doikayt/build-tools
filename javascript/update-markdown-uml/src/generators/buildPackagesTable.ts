/**
 * Builds a Markdown table listing leaf components and their descriptions.
 * Component names are clickable links to their corresponding component details
 * section anchors (e.g. [cli](#cli)).
 * If a description is absent or undefined, the cell renders as "TBD" —
 * a visible signal that the component description is missing.
 * Components are rendered in lexicographic order for determinism.
 */
export function buildPackagesTable(
  packages: string[],
  descriptions: Map<string, string | undefined>
): string {
  const sortedPackages = [...packages].sort((a, b) => a.localeCompare(b));

  const lines: string[] = [];
  lines.push("| Package | Description |");
  lines.push("|---------|-------------|");

  for (const pkg of sortedPackages) {
    const description = descriptions.get(pkg) ?? "TBD";
    lines.push(`| [${pkg}](#${pkg}) | ${description} |`);
  }

  return lines.join("\n");
}
