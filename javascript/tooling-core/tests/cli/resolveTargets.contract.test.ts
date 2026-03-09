import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { listFilesToProcess } from "../../src/cli/listFilesToProcess";
import type { RunConfig } from "../../src/repository/types";

function base(): RunConfig {
  return {
    runMode: "update",
    verbose: false,
    quiet: false,
    debug: false,
    mode: "single",
    recursivePath: undefined,
    exclude: []
  };
}

function tmpDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "cli-test-"));
}

function cleanup(dir: string) {
  fs.rmSync(dir, { recursive: true, force: true });
}

describe("listFilesToProcess — resolution behavior", () => {

  test("single mode defaults to README.md", () => {
    const dir = tmpDir();
    const readme = path.join(dir, "README.md");
    fs.writeFileSync(readme, "x");

    const cwd = process.cwd();
    process.chdir(dir);

    const result = listFilesToProcess(base(), []);

    expect(result.mode).toBe("single");
    expect(result.files).toEqual([readme]);

    process.chdir(cwd);
    cleanup(dir);
  });

  test("single mode throws if file missing", () => {
    const dir = tmpDir();
    const cwd = process.cwd();
    process.chdir(dir);

    expect(() => listFilesToProcess(base(), [])).toThrow();

    process.chdir(cwd);
    cleanup(dir);
  });

  test("recursive mode filters to .md files", () => {
    const dir = tmpDir();
    const docs = path.join(dir, "docs");
    fs.mkdirSync(docs);

    fs.writeFileSync(path.join(docs, "a.md"), "x");
    fs.writeFileSync(path.join(docs, "b.txt"), "x");

    const config: RunConfig = {
      ...base(),
      mode: "recursive",
      recursivePath: docs
    };

    const result = listFilesToProcess(config, []);

    expect(result.mode).toBe("recursive");
    expect(result.files.length).toBe(1);
    expect(result.files[0].endsWith("a.md")).toBe(true);

    cleanup(dir);
  });

});