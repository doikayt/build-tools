import { describe, test, expect } from "vitest";
import {
  LinkRecord,
  HeadingRecord,
  validateFragmentLink,
} from "../../src/index.js";

const headings: HeadingRecord[] = [
  { line: 1, rawText: "Introduction", slug: "introduction", level: 2 },
  { line: 5, rawText: "Install", slug: "install", level: 2 },
  { line: 9, rawText: "Install", slug: "install-1", level: 3 },
];

function makeLink(href: string, line = 10): LinkRecord {
  return { href: href, line: line, kind: "fragment" };
}

describe("validateFragmentLink()", () => {
  test("returns null for valid fragment", () => {
    const result = validateFragmentLink(
      "README.md",
      makeLink("#introduction"),
      headings
    );
    expect(result).toBeNull();
  });

  test("returns null for valid duplicate-heading slug", () => {
    const result = validateFragmentLink(
      "README.md",
      makeLink("#install-1"),
      headings
    );
    expect(result).toBeNull();
  });

  test("returns error for missing fragment", () => {
    const result = validateFragmentLink(
      "README.md",
      makeLink("#nonexistent"),
      headings
    );
    expect(result).not.toBeNull();
    expect(result!.reason).toBe("anchor not found in current file");
    expect(result!.link).toBe("#nonexistent");
    expect(result!.file).toBe("README.md");
    expect(result!.line).toBe(10);
  });

  test("returns error when headings list is empty", () => {
    const result = validateFragmentLink("README.md", makeLink("#anything"), []);
    expect(result).not.toBeNull();
    expect(result!.reason).toBe("anchor not found in current file");
  });
});
