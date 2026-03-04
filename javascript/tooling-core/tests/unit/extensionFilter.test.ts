import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { walkFiles } from "../../src/fs/walkFiles.js";

describe("walkFiles extension filtering", () => {

    test("only requested extensions are returned", () => {

        const root = fs.mkdtempSync(path.join(os.tmpdir(), "walkfiles-test-"));

        const md = path.join(root, "a.md");
        const txt = path.join(root, "b.txt");

        fs.writeFileSync(md, "# A");
        fs.writeFileSync(txt, "text");

        const files = walkFiles({
            rootDir: root,
            extensions: [".md"]
        });

        expect(files).toEqual([md]);

    });

});