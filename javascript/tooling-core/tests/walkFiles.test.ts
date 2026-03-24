import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { walkFiles, DEFAULT_EXCLUDE_DIRS } from "../src/fs/walkFiles";

function makeTmpDir(): string {
    return fs.mkdtempSync(path.join(os.tmpdir(), "walk-test-"));
}

function write(filePath: string): void {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, "x", "utf-8");
}

function cleanup(dir: string): void {
    fs.rmSync(dir, { recursive: true, force: true });
}

describe("walkFiles()", () => {
    test("returns empty array for empty directory", () => {
        const dir = makeTmpDir();
        const result = walkFiles({ rootDir: dir });
        expect(result).toEqual([]);
        cleanup(dir);
    });

    test("returns files in deterministic sorted order", () => {
        const dir = makeTmpDir();

        write(path.join(dir, "b.txt"));
        write(path.join(dir, "a.txt"));
        write(path.join(dir, "c.txt"));

        const result = walkFiles({ rootDir: dir });
        const basenames = result.map(p => path.basename(p));

        expect(basenames).toEqual(["a.txt", "b.txt", "c.txt"]);
        cleanup(dir);
    });

    test("recursively walks directories", () => {
        const dir = makeTmpDir();

        write(path.join(dir, "a.txt"));
        write(path.join(dir, "sub", "b.txt"));

        const result = walkFiles({ rootDir: dir });
        const basenames = result.map(p => path.basename(p));

        expect(basenames).toEqual(["a.txt", "b.txt"]);
        cleanup(dir);
    });

    test("filters by extension", () => {
        const dir = makeTmpDir();

        write(path.join(dir, "a.md"));
        write(path.join(dir, "b.txt"));

        const result = walkFiles({
            rootDir: dir,
            extensions: [".md"],
        });

        const basenames = result.map(p => path.basename(p));
        expect(basenames).toEqual(["a.md"]);

        cleanup(dir);
    });

    test("uses DEFAULT_EXCLUDE_DIRS by default", () => {
        const dir = makeTmpDir();

        write(path.join(dir, "visible.txt"));
        write(path.join(dir, "node_modules", "hidden.txt"));

        const result = walkFiles({ rootDir: dir });
        const basenames = result.map(p => path.basename(p));

        expect(basenames).toEqual(["visible.txt"]);
        expect(DEFAULT_EXCLUDE_DIRS.includes("node_modules")).toBe(true);

        cleanup(dir);
    });

    test("excludeDirs overrides default behavior", () => {
        const dir = makeTmpDir();

        write(path.join(dir, "a.txt"));
        write(path.join(dir, "custom", "b.txt"));

        const result = walkFiles({
            rootDir: dir,
            excludeDirs: ["custom"],
        });

        const basenames = result.map(p => path.basename(p));
        expect(basenames).toEqual(["a.txt"]);

        cleanup(dir);
    });

    test("deterministic across repeated calls", () => {
        const dir = makeTmpDir();

        write(path.join(dir, "b.txt"));
        write(path.join(dir, "a.txt"));

        const first = walkFiles({ rootDir: dir });
        const second = walkFiles({ rootDir: dir });

        expect(first).toEqual(second);

        cleanup(dir);
    });
});
