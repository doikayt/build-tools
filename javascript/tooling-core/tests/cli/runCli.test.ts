import {
  vi,
  test,
  expect,
  beforeEach,
  afterEach,
  type MockInstance,
} from "vitest";
import { runCli } from "../../src/index.js";
import type { ProcessingStatus } from "../../src/index.js";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const descriptor = {
  name: "test-plugin",
  description: "A test plugin",
  options: [],
};

const noopProcessor = {
  process(_filePath: string): ProcessingStatus {
    return "unchanged";
  },
};

let mockExit: MockInstance;

beforeEach(() => {
  mockExit = vi
    .spyOn(process, "exit")
    .mockImplementation((() => {}) as () => never);
});

afterEach(() => {
  mockExit.mockRestore();
});

test("calls process.exit(0) for --help", () => {
  runCli({
    descriptor: descriptor,
    processor: noopProcessor,
    argv: ["--help"],
  });

  expect(mockExit).toHaveBeenCalledWith(0);
});

test("calls process.exit(1) on unknown option", () => {
  runCli({
    descriptor: descriptor,
    processor: noopProcessor,
    argv: ["--not-a-real-flag"],
  });

  expect(mockExit).toHaveBeenCalledWith(1);
});

test("processes a single file", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "run-cli-test-"));
  const file = path.join(dir, "README.md");
  fs.writeFileSync(file, "# Hello");

  runCli({
    descriptor: descriptor,
    processor: noopProcessor,
    argv: [file],
  });

  expect(mockExit).not.toHaveBeenCalled();

  fs.rmSync(dir, { recursive: true, force: true });
});
