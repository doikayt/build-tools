import { describe, test, expect } from "vitest";
import { buildMermaid } from "../src/core/buildMermaid.js";

describe("^ (upstream fan-out) dep rendering", () => {
  test("renders a single ^ dep as a synthetic stadium node with an edge", () => {
    const output = buildMermaid({
      name: "my-proj",
      targets: {
        ci: { dependsOn: ["^build"] },
      },
    });

    expect(output).toBe(
      `${"```mermaid"}
graph TD

  ci

  _caret_build(["^build"])

  ci --> _caret_build
${"```"}`
    );
  });

  test("two targets sharing the same ^ dep render the caret node only once", () => {
    const output = buildMermaid({
      name: "my-proj",
      targets: {
        ci: { dependsOn: ["^build"] },
        deploy: { dependsOn: ["^build"] },
      },
    });

    expect(output).toBe(
      `${"```mermaid"}
graph TD

  ci
  deploy

  _caret_build(["^build"])

  ci --> _caret_build
  deploy --> _caret_build
${"```"}`
    );
  });

  test("two distinct ^ deps each get their own caret node, sorted alphabetically", () => {
    const output = buildMermaid({
      name: "my-proj",
      targets: {
        ci: { dependsOn: ["^test", "^build"] },
      },
    });

    expect(output).toBe(
      `${"```mermaid"}
graph TD

  ci

  _caret_build(["^build"])
  _caret_test(["^test"])

  ci --> _caret_build
  ci --> _caret_test
${"```"}`
    );
  });

  test("^ dep renders alongside same-project and cross-project deps; cross-project renders as hexagon", () => {
    const output = buildMermaid({
      name: "my-proj",
      targets: {
        ci: {
          dependsOn: ["^build", "my-proj:check", "@other/pkg:build"],
        },
        check: {},
      },
    });

    expect(output).toBe(
      `${"```mermaid"}
graph TD

  check
  ci

  _caret_build(["^build"])

  _xref_other_pkg_build{{"@other/pkg:build"}}

  ci --> _xref_other_pkg_build
  ci --> _caret_build
  ci --> check
${"```"}`
    );
  });

  test("no ^ deps — no caret node section, output structure unchanged", () => {
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
