import { describe, test, expect } from "vitest";
import { generateTOC } from "../src/engine/generateToc.js";

const wrap = (body: string) => `<!-- TOC:START -->\n<!-- TOC:END -->\n${body}`;

function extractToc(result: string): string {
  const start = result.indexOf("<!-- TOC:START -->");
  const end = result.indexOf("<!-- TOC:END -->") + "<!-- TOC:END -->".length;
  return result.slice(start, end);
}

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
