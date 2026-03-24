import { describe, test, expect, beforeAll, afterAll } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { validateRelativeLink } from "../../src/index.js";
import type { LinkRecord } from "../../src/index.js";

let tmpDir: string;

beforeAll(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "validate-relative-"));

    fs.writeFileSync(
        path.join(tmpDir, "target.md"),
        "# Introduction\n\n## Install\n\n## Install\n",
        "utf-8"
    );

    fs.writeFileSync(path.join(tmpDir, "source.md"), "# Source\n", "utf-8");
});

afterAll(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
});

function makeLink(href: string, line = 5): LinkRecord {
    return { href: href, line: line, kind: "relative" };
}

describe("validateRelativeLink()", () => {
    test("returns null for existing file with no fragment", () => {
        const source = path.join(tmpDir, "source.md");
        const result = validateRelativeLink(source, makeLink("./target.md"));
        expect(result).toBeNull();
    });

    test("returns error for missing file", () => {
        const source = path.join(tmpDir, "source.md");
        const result = validateRelativeLink(source, makeLink("./missing.md"));
        expect(result).not.toBeNull();
        expect(result!.reason).toBe("file not found");
        expect(result!.link).toBe("./missing.md");
    });

    test("returns null for existing file with valid anchor", () => {
        const source = path.join(tmpDir, "source.md");
        const result = validateRelativeLink(source, makeLink("./target.md#introduction"));
        expect(result).toBeNull();
    });

    test("returns error for existing file with missing anchor", () => {
        const source = path.join(tmpDir, "source.md");
        const result = validateRelativeLink(source, makeLink("./target.md#nonexistent"));
        expect(result).not.toBeNull();
        expect(result!.reason).toBe("anchor not found in target file");
    });

    test("returns error for missing file even with fragment", () => {
        const source = path.join(tmpDir, "source.md");
        const result = validateRelativeLink(source, makeLink("./missing.md#intro"));
        expect(result).not.toBeNull();
        expect(result!.reason).toBe("file not found");
    });

    test("file and line are reported correctly", () => {
        const source = path.join(tmpDir, "source.md");
        const result = validateRelativeLink(source, makeLink("./missing.md", 42));
        expect(result!.file).toBe(source);
        expect(result!.line).toBe(42);
    });
});
