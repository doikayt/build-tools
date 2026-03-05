import fs from "node:fs";
import path from "node:path";
import os from "node:os";

import { createTransformProcessor } from "../src";

const testConfig = {
  runMode: "update" as const,
  verbose: false,
  quiet: false,
  debug: false
};

test("processor updates file when content changes", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "processor-test-"));
  const file = path.join(dir, "test.txt");

  fs.writeFileSync(file, "hello", "utf8");

  const processor = createTransformProcessor((content) => {
    return content + " world";
  });
  const result = processor.process(file, testConfig);
  const updated = fs.readFileSync(file, "utf8");

  expect(result).toBe("updated");
  expect(updated).toBe("hello world");
});