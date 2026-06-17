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
      "qualifying `.ts` files and `_PACKAGE_INFO.md` descriptions"
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

  test("dangling code fence throws", () => {
    expect(() =>
      generateTOC(
        wrap(`
## Heading

\`\`\`bash
# unclosed
`)
      )
    ).toThrow("Unclosed code fence");
  });
});
