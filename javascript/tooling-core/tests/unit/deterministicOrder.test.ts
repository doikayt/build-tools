import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { walkFiles } from "../../src/fs/walkFiles.js";

describe("walkFiles deterministic ordering", () => {
    test("results are lexicographically sorted", () => {
        const root = fs.mkdtempSync(path.join(os.tmpdir(), "walkfiles-test-"));

        const a = path.join(root, "b.md");
        const b = path.join(root, "a.md");

        fs.writeFileSync(a, "# B");
        fs.writeFileSync(b, "# A");

        const files = walkFiles({
            rootDir: root,
            extensions: [".md"],
        });

        expect(files).toEqual([path.join(root, "a.md"), path.join(root, "b.md")]);
    });
});
