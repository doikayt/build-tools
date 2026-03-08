import { RepositoryRunner } from "../../src/repository/RepositoryRunner.js"

test("runner aborts when policy returns abort", () => {

  const processor = {
    process() {
      throw new Error("boom")
    }
  }

  const policy = {
    onProcessorError: () => "abort",
    shouldPrintFileStatus: () => false,
    shouldPrintSummary: () => false
  }

  const runner = new RepositoryRunner({
    processor,
    config: { quiet: true },
    policy
  })

  expect(() => runner.runFiles(["a.md"]))
    .toThrow("boom")

})
