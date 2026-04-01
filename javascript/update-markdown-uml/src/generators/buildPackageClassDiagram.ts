import { Project } from "ts-morph";
import path from "node:path";

/**
 * Builds a Mermaid classDiagram block for a single leaf package directory.
 * Uses ts-morph to extract classes, interfaces (exported and non-exported),
 * and type aliases. Standalone functions are excluded by design — their
 * presence in a package is surfaced via the placeholder node in the
 * flowchart overview diagram.
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
 * often the most architecturally significant abstraction in a package.
 */
export function buildPackageClassDiagram(leafDir: string): string {
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

  if (relationshipLines.length > 0) {
    lines.push("");
    for (const rel of relationshipLines) {
      lines.push(rel);
    }
  }

  lines.push("```");

  return lines.join("\n");
}

function visibilitySymbol(scope: string | undefined): string {
  if (scope === "private") return "-";
  if (scope === "protected") return "#";
  return "+";
}
