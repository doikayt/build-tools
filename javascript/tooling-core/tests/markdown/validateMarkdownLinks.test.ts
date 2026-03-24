import { describe, test, expect, beforeAll, afterAll, vi, afterEach } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { validateMarkdownLinks } from "../../src/markdown/validateMarkdownLinks.js";

let tmpDir: string;

beforeAll(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "validate-markdown-"));

    fs.writeFileSync(path.join(tmpDir, "target.md"), "# Target\n\n## Section\n", "utf-8");

    fs.writeFileSync(
        path.join(tmpDir, "valid.md"),
        [
            "# Valid",
            "",
            "<!-- TOC:START -->",
            "- [Valid](#valid)",
            "<!-- TOC:END -->",
            "",
            "[target](./target.md)",
            "[section](./target.md#section)",
            "[self](#valid)",
        ].join("\n"),
        "utf-8"
    );

    fs.writeFileSync(
        path.join(tmpDir, "broken-file.md"),
        ["# Broken File", "", "[missing](./missing.md)"].join("\n"),
        "utf-8"
    );

    fs.writeFileSync(
        path.join(tmpDir, "broken-fragment.md"),
        ["# Broken Fragment", "", "[bad](#nonexistent)"].join("\n"),
        "utf-8"
    );

    fs.writeFileSync(
        path.join(tmpDir, "toc-links.md"),
        [
            "# Doc",
            "",
            "<!-- TOC:START -->",
            "[broken-inside-toc](./missing.md)",
            "<!-- TOC:END -->",
            "",
            "## Section",
        ].join("\n"),
        "utf-8"
    );
});

afterAll(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
});

afterEach(() => {
    vi.unstubAllGlobals();
});

describe("validateMarkdownLinks()", () => {
    test("returns no errors for valid file", async () => {
        const result = await validateMarkdownLinks(path.join(tmpDir, "valid.md"), {
            validateExternal: false,
        });
        expect(result.errors).toHaveLength(0);
        expect(result.validatedCount).toBeGreaterThan(0);
    });

    test("returns error for missing relative file", async () => {
        const result = await validateMarkdownLinks(path.join(tmpDir, "broken-file.md"), {
            validateExternal: false,
        });
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0].reason).toBe("file not found");
    });

    test("returns error for missing fragment", async () => {
        const result = await validateMarkdownLinks(path.join(tmpDir, "broken-fragment.md"), {
            validateExternal: false,
        });
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0].reason).toBe("anchor not found in current file");
    });

    test("skips links inside managed TOC block", async () => {
        const result = await validateMarkdownLinks(path.join(tmpDir, "toc-links.md"), {
            validateExternal: false,
        });
        expect(result.errors).toHaveLength(0);
        expect(result.skippedCount).toBeGreaterThan(0);
    });

    test("skips external links when validateExternal is false", async () => {
        fs.writeFileSync(
            path.join(tmpDir, "external.md"),
            "# Doc\n\n[link](https://example.com)\n",
            "utf-8"
        );
        const result = await validateMarkdownLinks(path.join(tmpDir, "external.md"), {
            validateExternal: false,
        });
        expect(result.errors).toHaveLength(0);
    });

    test("validates external links when validateExternal is true", async () => {
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ status: 404 }));

        fs.writeFileSync(
            path.join(tmpDir, "external-broken.md"),
            "# Doc\n\n[link](https://example.com)\n",
            "utf-8"
        );
        const result = await validateMarkdownLinks(path.join(tmpDir, "external-broken.md"), {
            validateExternal: true,
            timeoutMs: 3000,
        });
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0].reason).toBe("HTTP 404");
    });
});
