import { unified } from "unified";
import remarkParse from "remark-parse";
import { visit } from "unist-util-visit";
import type { Link, Image, Definition } from "mdast";
import type { LinkKind, LinkRecord } from "./types.js";

const IGNORED_SCHEMES = ["mailto:", "tel:", "data:", "javascript:"];

function classifyHref(href: string): LinkKind | null {
    for (const scheme of IGNORED_SCHEMES) {
        if (href.startsWith(scheme)) {
            return null;
        }
    }
    if (href.startsWith("http://") || href.startsWith("https://")) {
        return "external";
    }
    if (href.startsWith("#")) {
        return "fragment";
    }
    return "relative";
}

function findManagedBlockRanges(
    markdownText: string,
    startMarker: string,
    endMarker: string
): Array<{ start: number; end: number }> {
    const lines = markdownText.split("\n");
    const ranges: Array<{ start: number; end: number }> = [];
    let blockStart: number | null = null;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.includes(startMarker) && blockStart === null) {
            blockStart = i + 1;
        } else if (line.includes(endMarker) && blockStart !== null) {
            ranges.push({ start: blockStart, end: i + 1 });
            blockStart = null;
        }
    }

    return ranges;
}

function isInManagedBlock(line: number, ranges: Array<{ start: number; end: number }>): boolean {
    return ranges.some(range => line >= range.start && line <= range.end);
}

export function extractLinks(
    markdownText: string,
    options?: {
        managedBlockStartMarker?: string;
        managedBlockEndMarker?: string;
        onDebug?: (message: string) => void;
    }
): { links: LinkRecord[]; skippedCount: number } {
    const startMarker = options?.managedBlockStartMarker ?? "<!-- TOC:START -->";
    const endMarker = options?.managedBlockEndMarker ?? "<!-- TOC:END -->";
    const onDebug = options?.onDebug;

    const managedRanges = findManagedBlockRanges(markdownText, startMarker, endMarker);
    const tree = unified().use(remarkParse).parse(markdownText);

    const links: LinkRecord[] = [];
    let skippedCount = 0;

    function processNode(href: string, line: number): void {
        if (isInManagedBlock(line, managedRanges)) {
            onDebug?.(`extractLinks: SKIPPED (managed block) href=${href} line=${line}`);
            skippedCount++;
            return;
        }
        const kind = classifyHref(href);
        if (kind === null) {
            onDebug?.(`extractLinks: SKIPPED (ignored scheme) href=${href} line=${line}`);
            skippedCount++;
            return;
        }
        onDebug?.(`extractLinks: ADDED kind=${kind} href=${href} line=${line}`);
        links.push({ href: href, line: line, kind: kind });
    }

    visit(tree, "link", (node: Link) => {
        processNode(node.url, node.position?.start.line ?? 0);
    });

    visit(tree, "image", (node: Image) => {
        processNode(node.url, node.position?.start.line ?? 0);
    });

    visit(tree, "definition", (node: Definition) => {
        processNode(node.url, node.position?.start.line ?? 0);
    });

    return { links: links, skippedCount: skippedCount };
}
