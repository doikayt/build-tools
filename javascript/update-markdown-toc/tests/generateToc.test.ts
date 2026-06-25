import { describe, test, expect } from "vitest";
import { generateTOC, stripInlineCode } from "../src/engine/generateToc.js";

const wrap = (body: string) => `<!-- TOC:START -->\n<!-- TOC:END -->\n${body}`;

function extractToc(result: string): string {
  const start = result.indexOf("<!-- TOC:START -->");
  const end = result.indexOf("<!-- TOC:END -->") + "<!-- TOC:END -->".length;
  return result.slice(start, end);
}

describe("stripInlineCode", () => {
  test("removes single inline code span", () => {
    expect(stripInlineCode("qualifying `.ts` files")).toBe("qualifying  files");
  });

  test("multiple spans leave no backticks behind", () => {
    const result = stripInlineCode(
      "qualifying `.ts` files and `_COMPONENT_INFO.md` descriptions"
    );
    expect(result).not.toContain("`");
    expect(result).toBe("qualifying  files and  descriptions");
  });

  test("does not remove content outside spans", () => {
    expect(stripInlineCode("before `code` after")).toBe("before  after");
  });

  test("span cannot cross a newline", () => {
    const result = stripInlineCode("open `start\nend` close");
    expect(result).toContain("`");
  });
});

describe("generateTOC — inline code span filtering", () => {
  test("TOC markers inside inline code spans are not treated as real markers", () => {
    const content =
      "Use `<!-- TOC:START -->` and `<!-- TOC:END -->` as delimiters.";
    expect(() => generateTOC(content)).toThrow("TOC delimiters not found");
  });

  test("real markers still work when inline code spans are present", () => {
    const content =
      "See `<!-- TOC:START -->` docs.\n<!-- TOC:START -->\n<!-- TOC:END -->\n## Heading\n";
    expect(() => generateTOC(content)).not.toThrow();
  });
});

describe("generateTOC — inline code in headings", () => {
  test("heading with inline code preserves backtick formatting in TOC entry", () => {
    const toc = extractToc(
      generateTOC(wrap("## Why `dist/` Must Be Present\n"))
    );
    expect(toc).toContain("Why `dist/` Must Be Present");
  });
});

describe("generateTOC — heading after HTML block", () => {
  test("heading after TOC is not swallowed by HTML block that appears before TOC", () => {
    // Pattern: HTML block sits before the TOC markers; heading sits after them.
    // When contentWithoutTOC is assembled, the blank lines between </p> and
    // <!-- TOC:START --> (stripped from `before`) and between <!-- TOC:END -->
    // and the heading (stripped from `after`) are removed, leaving </p>
    // immediately adjacent to the heading. Without a blank line at the
    // junction the CommonMark HTML block rule swallows the heading.
    const content = [
      "<p>",
      "  <img src='demo.gif'>",
      "</p>",
      "",
      "",
      "<!-- TOC:START -->",
      "<!-- TOC:END -->",
      "",
      "",
      "## Introduction",
      "",
      "Some content.",
      "",
    ].join("\n");
    const toc = extractToc(generateTOC(content));
    expect(toc).toContain("Introduction");
  });
});

describe("generateTOC — setext heading exclusion", () => {
  test("paragraph followed immediately by --- is not treated as a TOC heading", () => {
    const toc = extractToc(
      generateTOC(
        wrap(`
## Real Heading

A note for users.
---

## Another Real Heading
`)
      )
    );
    expect(toc).toContain("Real Heading");
    expect(toc).toContain("Another Real Heading");
    expect(toc).not.toContain("A note for users");
  });
});

describe("generateTOC — code fence filtering", () => {
  test("bash comment inside fence is not treated as heading", () => {
    const toc = extractToc(
      generateTOC(
        wrap(`
## Real Heading

\`\`\`bash
# this is a bash comment, not a heading
\`\`\`
`)
      )
    );
    expect(toc).toContain("Real Heading");
    expect(toc).not.toContain("this is a bash comment");
  });

  test("heading after closed fence is included", () => {
    const toc = extractToc(
      generateTOC(
        wrap(`
## Before

\`\`\`bash
# not a heading
\`\`\`

## After
`)
      )
    );
    expect(toc).toContain("Before");
    expect(toc).toContain("After");
    expect(toc).not.toContain("not a heading");
  });

  test("multiple fences all suppressed", () => {
    const toc = extractToc(
      generateTOC(
        wrap(`
## Title

\`\`\`bash
# first
\`\`\`

\`\`\`ts
# second
\`\`\`
`)
      )
    );
    expect(toc).toContain("Title");
    expect(toc).not.toContain("first");
    expect(toc).not.toContain("second");
  });

  test("dangling code fence: heading before fence included, content inside excluded", () => {
    const toc = extractToc(
      generateTOC(
        wrap(`
## Heading

\`\`\`bash
# unclosed
`)
      )
    );
    expect(toc).toContain("Heading");
    expect(toc).not.toContain("unclosed");
  });
});
