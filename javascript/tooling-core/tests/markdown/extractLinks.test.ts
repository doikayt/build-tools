import { describe, test, expect } from "vitest";
import { extractLinks } from "../../src/markdown/extractLinks.js";

describe("extractLinks()", () => {
    // ----------------------------------------------------------
    // Basic classification
    // ----------------------------------------------------------

    test("classifies external link as external", () => {
        const { links } = extractLinks("# Title\n\n[link](https://example.com)\n");
        expect(links).toHaveLength(1);
        expect(links[0].kind).toBe("external");
        expect(links[0].href).toBe("https://example.com");
    });

    test("classifies http link as external", () => {
        const { links } = extractLinks("# Title\n\n[link](http://example.com)\n");
        expect(links).toHaveLength(1);
        expect(links[0].kind).toBe("external");
    });

    test("classifies fragment link as fragment", () => {
        const { links } = extractLinks("# Title\n\n[link](#section)\n");
        expect(links).toHaveLength(1);
        expect(links[0].kind).toBe("fragment");
        expect(links[0].href).toBe("#section");
    });

    test("classifies relative link as relative", () => {
        const { links } = extractLinks("# Title\n\n[link](./docs/guide.md)\n");
        expect(links).toHaveLength(1);
        expect(links[0].kind).toBe("relative");
        expect(links[0].href).toBe("./docs/guide.md");
    });

    test("classifies relative link without ./ as relative", () => {
        const { links } = extractLinks("# Title\n\n[link](docs/guide.md)\n");
        expect(links).toHaveLength(1);
        expect(links[0].kind).toBe("relative");
    });

    test("classifies relative link with fragment as relative", () => {
        const { links } = extractLinks("# Title\n\n[link](./guide.md#section)\n");
        expect(links).toHaveLength(1);
        expect(links[0].kind).toBe("relative");
    });

    // ----------------------------------------------------------
    // Ignored schemes
    // ----------------------------------------------------------

    test("ignores mailto links", () => {
        const { links, skippedCount } = extractLinks("[email](mailto:foo@example.com)\n");
        expect(links).toHaveLength(0);
        expect(skippedCount).toBe(1);
    });

    test("ignores tel links", () => {
        const { links, skippedCount } = extractLinks("[call](tel:+1234567890)\n");
        expect(links).toHaveLength(0);
        expect(skippedCount).toBe(1);
    });

    test("ignores data links", () => {
        const { links, skippedCount } = extractLinks("[data](data:text/plain;base64,abc)\n");
        expect(links).toHaveLength(0);
        expect(skippedCount).toBe(1);
    });

    test("ignores javascript links", () => {
        const { links, skippedCount } = extractLinks("[js](javascript:void(0))\n");
        expect(links).toHaveLength(0);
        expect(skippedCount).toBe(1);
    });

    // ----------------------------------------------------------
    // Code block exclusion
    // ----------------------------------------------------------

    test("ignores links inside fenced code block", () => {
        const md = ["# Title", "", "```", "[link](https://example.com)", "```", ""].join("\n");
        const { links } = extractLinks(md);
        expect(links).toHaveLength(0);
    });

    test("ignores links inside inline code", () => {
        const { links } = extractLinks("Use `[link](https://example.com)` here.\n");
        expect(links).toHaveLength(0);
    });

    test("extracts link outside code block when mixed", () => {
        const md = [
            "# Title",
            "",
            "```",
            "[inside](https://inside.com)",
            "```",
            "",
            "[outside](https://outside.com)",
            "",
        ].join("\n");
        const { links } = extractLinks(md);
        expect(links).toHaveLength(1);
        expect(links[0].href).toBe("https://outside.com");
    });

    // ----------------------------------------------------------
    // Managed TOC block exclusion
    // ----------------------------------------------------------

    test("ignores links inside managed TOC block", () => {
        const md = [
            "# Title",
            "",
            "<!-- TOC:START -->",
            "[ignored](#section)",
            "<!-- TOC:END -->",
            "",
            "## Section",
            "",
        ].join("\n");
        const { links, skippedCount } = extractLinks(md);
        expect(links).toHaveLength(0);
        expect(skippedCount).toBe(1);
    });

    test("extracts links outside managed TOC block", () => {
        const md = [
            "# Title",
            "",
            "<!-- TOC:START -->",
            "[ignored](#section)",
            "<!-- TOC:END -->",
            "",
            "[real](#section)",
            "",
            "## Section",
            "",
        ].join("\n");
        const { links } = extractLinks(md);
        expect(links).toHaveLength(1);
        expect(links[0].href).toBe("#section");
    });

    test("respects custom managed block markers", () => {
        const md = [
            "# Title",
            "",
            "<!-- CUSTOM:START -->",
            "[ignored](#section)",
            "<!-- CUSTOM:END -->",
            "",
            "[real](#section)",
            "",
        ].join("\n");
        const { links, skippedCount } = extractLinks(md, {
            managedBlockStartMarker: "<!-- CUSTOM:START -->",
            managedBlockEndMarker: "<!-- CUSTOM:END -->",
        });
        expect(links).toHaveLength(1);
        expect(skippedCount).toBe(1);
    });

    // ----------------------------------------------------------
    // Image and definition links
    // ----------------------------------------------------------

    test("extracts image links", () => {
        const { links } = extractLinks("![alt](./image.png)\n");
        expect(links).toHaveLength(1);
        expect(links[0].href).toBe("./image.png");
        expect(links[0].kind).toBe("relative");
    });

    test("extracts external image links", () => {
        const { links } = extractLinks("![alt](https://example.com/image.png)\n");
        expect(links).toHaveLength(1);
        expect(links[0].kind).toBe("external");
    });

    test("extracts definition links", () => {
        const md = "[link][ref]\n\n[ref]: https://example.com\n";
        const { links } = extractLinks(md);
        expect(links.some(l => l.href === "https://example.com")).toBe(true);
    });

    // ----------------------------------------------------------
    // Line numbers
    // ----------------------------------------------------------

    test("reports correct line number for link", () => {
        const md = "# Title\n\nSome text.\n\n[link](https://example.com)\n";
        const { links } = extractLinks(md);
        expect(links[0].line).toBe(5);
    });

    // ----------------------------------------------------------
    // Edge cases
    // ----------------------------------------------------------

    test("empty document returns no links", () => {
        const { links, skippedCount } = extractLinks("");
        expect(links).toHaveLength(0);
        expect(skippedCount).toBe(0);
    });

    test("document with no links returns no links", () => {
        const { links } = extractLinks("# Title\n\nJust text, no links.\n");
        expect(links).toHaveLength(0);
    });

    test("multiple links in one document", () => {
        const md = [
            "# Title",
            "",
            "[a](https://a.com)",
            "[b](#section)",
            "[c](./guide.md)",
            "",
        ].join("\n");
        const { links } = extractLinks(md);
        expect(links).toHaveLength(3);
        expect(links.map(l => l.kind)).toEqual(["external", "fragment", "relative"]);
    });

    test("skippedCount accumulates across multiple ignored links", () => {
        const md = [
            "[a](mailto:a@example.com)",
            "[b](tel:123)",
            "[c](javascript:void(0))",
            "",
        ].join("\n");
        const { links, skippedCount } = extractLinks(md);
        expect(links).toHaveLength(0);
        expect(skippedCount).toBe(3);
    });
});
