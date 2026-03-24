import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { walkFiles } from "../../src/fs/walkFiles.js";

describe("walkFiles exclusion override", () => {
    test("node_modules traversal allowed when override provided", () => {
        const root = fs.mkdtempSync(path.join(os.tmpdir(), "walkfiles-test-"));

        fs.mkdirSync(path.join(root, "docs"), { recursive: true });
        fs.mkdirSync(path.join(root, "node_modules/pkg"), { recursive: true });

        const good = path.join(root, "docs", "a.md");
        const intruder = path.join(root, "node_modules", "pkg", "intruder.md");

        fs.writeFileSync(good, "# A");
        fs.writeFileSync(intruder, "# BAD");

        const files = walkFiles({
            rootDir: root,
            extensions: [".md"],
            excludeDirs: [],
        });

        expect(files.sort()).toEqual([good, intruder].sort());
    });
});
