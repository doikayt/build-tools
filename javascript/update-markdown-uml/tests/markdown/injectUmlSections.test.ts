import { describe, test, expect } from "vitest";
import {
  injectUmlSections,
  UML_MARKERS,
} from "../../src/markdown/injectUmlSections.js";

const PKG_START = UML_MARKERS.COMPONENTS_START;
const PKG_END = UML_MARKERS.COMPONENTS_END;
const TBL_START = UML_MARKERS.COMPONENTS_TABLE_START;
const TBL_END = UML_MARKERS.COMPONENTS_TABLE_END;
const DET_START = UML_MARKERS.COMPONENT_DETAILS_START;
const DET_END = UML_MARKERS.COMPONENT_DETAILS_END;

const SECTIONS = {
  components: "flowchart TB",
  componentsTable: "| Package | Description |",
  componentDetails: "#### cli",
};

function makeDoc(...markers: string[]): string {
  return markers.join("\n");
}

describe("injectUmlSections()", () => {
  test("injects all three sections when all markers present", () => {
    const content = makeDoc(
      PKG_START,
      PKG_END,
      TBL_START,
      TBL_END,
      DET_START,
      DET_END
    );
    const result = injectUmlSections(content, SECTIONS, []);
    expect(result).toContain("flowchart TB");
    expect(result).toContain("| Package | Description |");
    expect(result).toContain("#### cli");
  });

  test("missing components marker pair is silently skipped", () => {
    const content = makeDoc(TBL_START, TBL_END, DET_START, DET_END);
    const result = injectUmlSections(content, SECTIONS, []);
    expect(result).toContain("| Package | Description |");
    expect(result).toContain("#### cli");
    expect(result).not.toContain("flowchart TB");
  });

  test("missing components-table marker pair is silently skipped", () => {
    const content = makeDoc(PKG_START, PKG_END, DET_START, DET_END);
    const result = injectUmlSections(content, SECTIONS, []);
    expect(result).toContain("flowchart TB");
    expect(result).toContain("#### cli");
    expect(result).not.toContain("| Package | Description |");
  });

  test("missing component-details marker pair is silently skipped", () => {
    const content = makeDoc(PKG_START, PKG_END, TBL_START, TBL_END);
    const result = injectUmlSections(content, SECTIONS, []);
    expect(result).toContain("flowchart TB");
    expect(result).toContain("| Package | Description |");
    expect(result).not.toContain("#### cli");
  });

  test("no markers present returns content unchanged", () => {
    const content = "# No markers here";
    const result = injectUmlSections(content, SECTIONS, []);
    expect(result).toBe(content);
  });

  test("existing content between markers is replaced", () => {
    const content = makeDoc(
      PKG_START,
      "OLD CONTENT",
      PKG_END,
      TBL_START,
      TBL_END,
      DET_START,
      DET_END
    );
    const result = injectUmlSections(content, SECTIONS, []);
    expect(result).not.toContain("OLD CONTENT");
    expect(result).toContain("flowchart TB");
  });

  test("throws when start marker appears more than once", () => {
    const content = makeDoc(PKG_START, PKG_END, PKG_START, PKG_END);
    expect(() => injectUmlSections(content, SECTIONS, [])).toThrow("Duplicate");
  });

  test("warns when component name collides with existing heading", () => {
    const content = ["## cli", "", PKG_START, PKG_END].join("\n");
    const warnings: string[] = [];
    injectUmlSections(content, SECTIONS, ["cli"], (msg) => warnings.push(msg));
    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toContain("cli");
    expect(warnings[0]).toContain("collides");
  });

  test("no warning for component heading inside component-details region from prior run", () => {
    const content = [
      "## Overview",
      "",
      PKG_START,
      PKG_END,
      "",
      DET_START,
      "#### cli",
      "```mermaid",
      "classDiagram",
      "```",
      DET_END,
    ].join("\n");
    const warnings: string[] = [];
    injectUmlSections(content, SECTIONS, ["cli"], (msg) => warnings.push(msg));
    expect(warnings).toHaveLength(0);
  });

  test("no warning when component name does not collide", () => {
    const content = ["## Overview", "", PKG_START, PKG_END].join("\n");
    const warnings: string[] = [];
    injectUmlSections(content, SECTIONS, ["cli"], (msg) => warnings.push(msg));
    expect(warnings).toHaveLength(0);
  });

  test("injection is idempotent", () => {
    const content = makeDoc(
      PKG_START,
      PKG_END,
      TBL_START,
      TBL_END,
      DET_START,
      DET_END
    );
    const first = injectUmlSections(content, SECTIONS, []);
    const second = injectUmlSections(first, SECTIONS, []);
    expect(first).toBe(second);
  });

  test("content outside markers is preserved", () => {
    const content = [
      "# Title",
      "",
      "Some intro text.",
      "",
      PKG_START,
      PKG_END,
      "",
      "Some footer text.",
    ].join("\n");
    const result = injectUmlSections(content, SECTIONS, []);
    expect(result).toContain("# Title");
    expect(result).toContain("Some intro text.");
    expect(result).toContain("Some footer text.");
  });
});
