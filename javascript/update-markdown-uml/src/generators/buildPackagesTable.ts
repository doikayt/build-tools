/**
 * Builds a Markdown table listing leaf packages and their descriptions.
 * Package names are clickable links to their corresponding package details
 * section anchors (e.g. [cli](#cli)).
 * If a description is absent or undefined, the cell renders as "TBD" —
 * a visible signal that the package description is missing.
 * Packages are rendered in lexicographic order for determinism.
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
