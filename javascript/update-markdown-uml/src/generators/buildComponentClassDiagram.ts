import { Project, type FunctionDeclaration } from "ts-morph";
import path from "node:path";
import { extractFirstSentence } from "@datalackey/tooling-core";

/**
 * Builds a Mermaid classDiagram block for a single leaf component directory.
 * Uses ts-morph to extract classes, interfaces (exported and non-exported),
 * and type aliases. When none of those are found (function-only component),
 * falls back to a Markdown table of exported functions instead.
 *
 * Arrow styles:
 *   --|>  class extends class
 *   ..|>  interface extends interface, or class implements interface
 *   ..>   usage/call dependency (not used here — handled at flowchart level)
 *
 * Type aliases are rendered with a <<type>> stereotype and no members,
 * since their values (often union types) are implementation detail.
 *
 * Non-exported declarations are included — a non-exported base type is
 * often the most architecturally significant abstraction in a component.
 *
 * @param warn  Optional callback for diagnostic messages. Pass a no-op to
 *              suppress output (equivalent to --quiet). When omitted, no
 *              warnings are emitted.
 */
export function buildComponentClassDiagram(
  leafDir: string,
  warn?: (msg: string) => void
): string {
  const project = new Project({
    skipAddingFilesFromTsConfig: true,
    compilerOptions: {
      skipLibCheck: true,
      noLib: true,
    },
  });

  project.addSourceFilesAtPaths(path.join(leafDir, "**/*.ts"));

  const lines: string[] = [];
  lines.push("```mermaid");
  lines.push("classDiagram");
  lines.push("  direction TB");

  const relationshipLines: string[] = [];

  for (const sf of project.getSourceFiles()) {
    // --------------------------------------------------
    // Classes
    // --------------------------------------------------
    for (const cls of sf.getClasses()) {
      const name = cls.getName();
      if (name === undefined || name === "") continue;

      lines.push(`  class ${name} {`);

      for (const prop of cls.getProperties()) {
        const vis = visibilitySymbol(prop.getScope());
        const typeText = prop.getTypeNode()?.getText() ?? "unknown";
        lines.push(`    ${vis}${prop.getName()} ${typeText}`);
      }

      for (const method of cls.getMethods()) {
        const vis = visibilitySymbol(method.getScope());
        const returnType = method.getReturnTypeNode()?.getText() ?? "unknown";
        const params = method
          .getParameters()
          .map((p) => p.getName())
          .join(", ");
        lines.push(`    ${vis}${method.getName()}(${params}) ${returnType}`);
      }

      lines.push("  }");

      const base = cls.getBaseClass();
      const baseName = base?.getName();
      if (baseName !== undefined && baseName !== "") {
        relationshipLines.push(`  ${name} --|> ${baseName}`);
      }

      for (const iface of cls.getImplements()) {
        const ifaceName = iface.getExpression().getText();
        relationshipLines.push(`  ${name} ..|> ${ifaceName}`);
      }
    }

    // --------------------------------------------------
    // Interfaces (exported and non-exported)
    // --------------------------------------------------
    for (const iface of sf.getInterfaces()) {
      const name = iface.getName();

      lines.push(`  class ${name} {`);
      lines.push(`    <<interface>>`);

      for (const prop of iface.getProperties()) {
        const optional = prop.hasQuestionToken() ? "?" : "";
        const typeText = prop.getTypeNode()?.getText() ?? "unknown";
        lines.push(`    +${prop.getName()}${optional} ${typeText}`);
      }

      for (const method of iface.getMethods()) {
        const returnType = method.getReturnTypeNode()?.getText() ?? "unknown";
        const params = method
          .getParameters()
          .map((p) => p.getName())
          .join(", ");
        lines.push(`    +${method.getName()}(${params}) ${returnType}`);
      }

      lines.push("  }");

      for (const base of iface.getBaseDeclarations()) {
        const baseName = base.getName();
        if (baseName !== undefined && baseName !== "") {
          relationshipLines.push(`  ${name} ..|> ${baseName}`);
        }
      }
    }

    // --------------------------------------------------
    // Type aliases — name + <<type>> stereotype, no members
    // --------------------------------------------------
    for (const typeAlias of sf.getTypeAliases()) {
      const name = typeAlias.getName();
      lines.push(`  class ${name} {`);
      lines.push(`    <<type>>`);
      lines.push("  }");
    }
  }

  // If nothing was added beyond the three header lines, this is a function-only
  // component (no classes, interfaces, or type aliases). Discard the partial
  // mermaid block and render a Markdown function table instead.
  if (lines.length === 3) {
    return buildFunctionTable(project, path.basename(leafDir), warn);
  }

  if (relationshipLines.length > 0) {
    lines.push("");
    for (const rel of relationshipLines) {
      lines.push(rel);
    }
  }

  lines.push("```");

  return lines.join("\n");
}

function buildFunctionTable(
  project: Project,
  componentName: string,
  warn?: (msg: string) => void
): string {
  const exportedFunctions: FunctionDeclaration[] = [];

  for (const sf of project.getSourceFiles()) {
    for (const func of sf.getFunctions()) {
      if (func.isExported()) {
        exportedFunctions.push(func);
      }
    }
  }

  if (exportedFunctions.length === 0) {
    warn?.(
      `warn: [${componentName}] has no exported functions, classes, interfaces, or types`
    );
    return "_No exported types or functions._";
  }

  const tableLines: string[] = [
    "| Function | Parameters | Returns | Description |",
    "|----------|------------|---------|-------------|",
  ];

  for (const func of exportedFunctions) {
    const params = func.getParameters();
    const paramsCell =
      params.length === 0
        ? "—"
        : params
            .map(
              (p) =>
                `${p.getName()}: ${p.getTypeNode()?.getText() ?? "unknown"}`
            )
            .join("<br>");

    const returnsCell = func.getReturnTypeNode()?.getText() ?? "unknown";

    const rawDesc = func.getJsDocs()[0]?.getDescription()?.trim() ?? "";
    let descCell: string;
    if (!rawDesc) {
      warn?.(
        `warn: [${componentName}] function \`${func.getName()}\` has no JSDoc description`
      );
      descCell = "—";
    } else {
      descCell = extractFirstSentence(rawDesc);
    }

    tableLines.push(
      `| \`${func.getName()}\` | ${paramsCell} | ${returnsCell} | ${descCell} |`
    );
  }

  return tableLines.join("\n");
}


function visibilitySymbol(scope: string | undefined): string {
  if (scope === "private") return "-";
  if (scope === "protected") return "#";
  return "+";
}
