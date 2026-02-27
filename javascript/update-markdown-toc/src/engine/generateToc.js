import GithubSlugger from "github-slugger";

const START = "<!-- TOC:START -->";
const END   = "<!-- TOC:END -->";


function detectLineEnding(text) {
    return text.includes("\r\n") ? "\r\n" : "\n";
}

export function generateTOC(content) {
    const lineEnding = detectLineEnding(content);

    const hasStart = content.includes(START);
    const hasEnd   = content.includes(END);

    if (!hasStart && !hasEnd) throw new Error("TOC delimiters not found");
    if (hasStart && !hasEnd)  throw new Error("TOC start delimiter found without end");
    if (!hasStart && hasEnd)  throw new Error("TOC end delimiter found without start");

    const startIndex = content.indexOf(START);
    const endIndex   = content.indexOf(END);

    const before = content.slice(0, startIndex);
    const after  = content.slice(endIndex + END.length);

    const contentWithoutTOC =
        before.replace(/\s*$/, "") +
        lineEnding +
        after.replace(/^\s*/, "");

    const lines = contentWithoutTOC.split(lineEnding);
    const headings = [];
    const slugger = new GithubSlugger();

    for (const line of lines) {
        const m = /^(#{1,6})\s+(.*)$/.exec(line);
        if (!m) continue;

        const level = m[1].length;
        const title = m[2].trim();
        const anchor = slugger.slug(title);

        headings.push({ level, title, anchor });
    }

    if (headings.length === 0) {
        throw new Error("No headings found to generate TOC");
    }

    const minLevel = Math.min(...headings.map(h => h.level));

    const tocLines = headings.map(h => {
        const indent = "  ".repeat(h.level - minLevel);
        return `${indent}- [${h.title}](#${h.anchor})`;
    });

    const tocBlock =
        lineEnding +
        tocLines.join(lineEnding) +
        lineEnding;

    return before + START + tocBlock + END + after;
}
