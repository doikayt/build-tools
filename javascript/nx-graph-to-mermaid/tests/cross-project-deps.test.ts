import { describe, test, expect } from "vitest";
import { buildMermaid } from "../src/core/buildMermaid.js";

describe("cross-project dep rendering", () => {
  test("renders a single cross-project dep as a synthetic hexagon node", () => {
    const output = buildMermaid({
      name: "my-proj",
      targets: {
        ci: { dependsOn: ["@scope/pkg:build"] },
      },
    });

    expect(output).toBe(
      `${"```mermaid"}
graph TD

  ci

  _xref_scope_pkg_build{{"pkg:build"}}

  ci --> _xref_scope_pkg_build
${"```"}`
    );
  });

  test("two targets sharing the same cross-project dep render the node only once", () => {
    const output = buildMermaid({
      name: "my-proj",
      targets: {
        ci: { dependsOn: ["@scope/pkg:build"] },
        deploy: { dependsOn: ["@scope/pkg:build"] },
      },
    });

    expect(output).toBe(
      `${"```mermaid"}
graph TD

  ci
  deploy

  _xref_scope_pkg_build{{"pkg:build"}}

  ci --> _xref_scope_pkg_build
  deploy --> _xref_scope_pkg_build
${"```"}`
    );
  });

  test("two distinct cross-project deps each get their own node, sorted alphabetically", () => {
    const output = buildMermaid({
      name: "my-proj",
      targets: {
        ci: { dependsOn: ["@scope/pkg-b:build", "@scope/pkg-a:build"] },
      },
    });

    expect(output).toBe(
      `${"```mermaid"}
graph TD

  ci

  _xref_scope_pkg_a_build{{"pkg-a:build"}}
  _xref_scope_pkg_b_build{{"pkg-b:build"}}

  ci --> _xref_scope_pkg_a_build
  ci --> _xref_scope_pkg_b_build
${"```"}`
    );
  });

  test("no cross-project deps — no cross-project section, output structure unchanged", () => {
    const output = buildMermaid({
      name: "my-proj",
      targets: {
        build: { dependsOn: ["lint"] },
        lint: {},
      },
    });

    expect(output).toBe(
      `${"```mermaid"}
graph TD

  build
  lint

  build --> lint
${"```"}`
    );
  });
});
