import { describe, test, expect } from "vitest";
import { parseHeadings } from "../../src/markdown/parseHeadings.js";

describe("parseHeadings — inline code in headings", () => {
  test("inline code content is included in rawText with backtick delimiters", () => {
    const result = parseHeadings("## Why `dist/` Must Be Present");
    expect(result[0].rawText).toBe("Why `dist/` Must Be Present");
  });

  test("slug is derived from text including inline code content", () => {
    const result = parseHeadings("## Why `dist/` Must Be Present");
    expect(result[0].slug).toBe("why-dist-must-be-present");
  });

  test("plain heading with no inline code is unaffected", () => {
    const result = parseHeadings("## Just a Heading");
    expect(result[0].rawText).toBe("Just a Heading");
  });
});
