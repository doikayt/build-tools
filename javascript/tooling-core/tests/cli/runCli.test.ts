import {
  vi,
  test,
  expect,
  beforeEach,
  afterEach,
  describe,
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

test("--version prints '<name> <semver>' and exits 0", async () => {
  const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

  await runCli({
    descriptor: descriptor,
    processor: noopProcessor,
    argv: ["--version"],
  });

  expect(mockExit).toHaveBeenCalledWith(0);
  expect(consoleSpy).toHaveBeenCalledWith(
    expect.stringMatching(/^test-plugin \d+\.\d+\.\d+/)
  );

  consoleSpy.mockRestore();
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

async function assertCollidesWithStandardFlag(flag: string): Promise<void> {
  const collidingDescriptor = {
    ...descriptor,
    options: [{ flag: flag, description: "custom flag" }],
  };

  await runCli({
    descriptor: collidingDescriptor,
    processor: noopProcessor,
    argv: [],
  });

  expect(mockExit).toHaveBeenCalledWith(1);
}

describe("descriptor option flag collision detection", () => {
  test("exits 1 when plugin declares option colliding with --verbose", async () => {
    await assertCollidesWithStandardFlag("--verbose");
  });

  test("exits 1 when plugin declares option colliding with -v", async () => {
    await assertCollidesWithStandardFlag("-v");
  });

  test("exits 1 when plugin declares option colliding with --check", async () => {
    await assertCollidesWithStandardFlag("--check");
  });

  test("exits 1 when plugin declares option colliding with -c", async () => {
    await assertCollidesWithStandardFlag("-c");
  });

  test("exits 1 when plugin declares option colliding with --recursive", async () => {
    await assertCollidesWithStandardFlag("--recursive");
  });

  test("exits 1 when plugin declares option colliding with -r", async () => {
    await assertCollidesWithStandardFlag("-r");
  });

  test("exits 1 when plugin declares option colliding with --exclude", async () => {
    await assertCollidesWithStandardFlag("--exclude");
  });

  test("exits 1 when plugin declares option colliding with -e", async () => {
    await assertCollidesWithStandardFlag("-e");
  });

  test("exits 1 when plugin declares option colliding with --quiet", async () => {
    await assertCollidesWithStandardFlag("--quiet");
  });

  test("exits 1 when plugin declares option colliding with -q", async () => {
    await assertCollidesWithStandardFlag("-q");
  });

  test("exits 1 when plugin declares option colliding with --debug", async () => {
    await assertCollidesWithStandardFlag("--debug");
  });

  test("exits 1 when plugin declares option colliding with -d", async () => {
    await assertCollidesWithStandardFlag("-d");
  });

  test("exits 1 when plugin declares option colliding with --help", async () => {
    await assertCollidesWithStandardFlag("--help");
  });

  test("exits 1 when plugin declares option colliding with -h", async () => {
    await assertCollidesWithStandardFlag("-h");
  });

  test("does not exit 1 when plugin declares non-colliding options", async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "run-cli-no-collision-"));
    const file = path.join(dir, "README.md");
    fs.writeFileSync(file, "# Hello");

    const safeDescriptor = {
      ...descriptor,
      options: [
        { flag: "--output", description: "output path", requiresValue: true },
        { flag: "-o", description: "output path short" },
      ],
    };

    await runCli({
      descriptor: safeDescriptor,
      processor: noopProcessor,
      argv: [file],
    });

    expect(mockExit).not.toHaveBeenCalledWith(1);

    fs.rmSync(dir, { recursive: true, force: true });
  });
});

// ----------------------------------------------------------------
// afterRun hook tests
// FAIL until Step 5: afterRun added to PluginDescriptor + called from runCli.
// ----------------------------------------------------------------

describe("afterRun hook", () => {
  test("afterRun is called when defined on descriptor", async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "run-cli-afterrun-"));
    const file = path.join(dir, "README.md");
    fs.writeFileSync(file, "# Hello");

    const afterRunMock = vi.fn().mockResolvedValue(undefined);

    await runCli({
      descriptor: { ...descriptor, afterRun: afterRunMock } as any,
      processor: noopProcessor,
      argv: [file],
    });

    expect(afterRunMock).toHaveBeenCalledOnce();

    fs.rmSync(dir, { recursive: true, force: true });
  });

  test("afterRun is not called when not defined on descriptor", async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "run-cli-no-afterrun-"));
    const file = path.join(dir, "README.md");
    fs.writeFileSync(file, "# Hello");

    await runCli({
      descriptor: descriptor,
      processor: noopProcessor,
      argv: [file],
    });

    expect(mockExit).not.toHaveBeenCalled();

    fs.rmSync(dir, { recursive: true, force: true });
  });

  test("afterRun receives the files that were processed", async () => {
    const dir = fs.mkdtempSync(
      path.join(os.tmpdir(), "run-cli-afterrun-files-")
    );
    const file = path.join(dir, "README.md");
    fs.writeFileSync(file, "# Hello");

    let capturedFiles: string[] = [];
    const afterRunMock = vi.fn().mockImplementation(async (files: string[]) => {
      capturedFiles = files;
    });

    await runCli({
      descriptor: { ...descriptor, afterRun: afterRunMock } as any,
      processor: noopProcessor,
      argv: [file],
    });

    expect(capturedFiles).toEqual([file]);

    fs.rmSync(dir, { recursive: true, force: true });
  });

  test("afterRun is not called when --help exits early", () => {
    const afterRunMock = vi.fn().mockResolvedValue(undefined);

    runCli({
      descriptor: { ...descriptor, afterRun: afterRunMock } as any,
      processor: noopProcessor,
      argv: ["--help"],
    });

    expect(afterRunMock).not.toHaveBeenCalled();
  });
});
