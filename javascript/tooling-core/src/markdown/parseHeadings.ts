import { unified } from "unified";
import remarkParse from "remark-parse";
import { visit } from "unist-util-visit";
import GithubSlugger from "github-slugger";
import type { Heading, Text } from "mdast";
import type { HeadingRecord } from "./types.js";

function extractHeadingText(node: Heading): string {
  const parts: string[] = [];
  visit(node, "text", (textNode: Text) => {
    parts.push(textNode.value);
  });
  return parts.join("");
}

export function parseHeadings(markdownText: string): HeadingRecord[] {
  const tree = unified().use(remarkParse).parse(markdownText);
  const slugger = new GithubSlugger();
  const headings: HeadingRecord[] = [];

  visit(tree, "heading", (node: Heading) => {
    const rawText = extractHeadingText(node);
    const slug = slugger.slug(rawText);
    const line = node.position?.start.line ?? 0;
    headings.push({ line: line, rawText: rawText, slug: slug });
  });

  return headings;
}
